'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/contexts/SocketContext'; // Import useSocket
import dynamic from 'next/dynamic';
import { MapPin, Bike, CheckCircle, BellRing, X } from 'lucide-react'; // Assuming lucide-react is installed

import NoSSR from '@/components/NoSSR';

interface DeliveryRequest {
  id: string;
  clientLocation: any; // Stored as JSON string in DB
  destination: any;   // Stored as JSON string in DB
  description: string | null;
  client: {
    name: string;
    email: string;
  };
}

export default function RiderDashboardPage() {
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [error, setError] = useState('');
  const [newRequestAlert, setNewRequestAlert] = useState<DeliveryRequest | null>(null);
  const [acceptedDelivery, setAcceptedDelivery] = useState<DeliveryRequest | null>(null);
  const [riderLocation, setRiderLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [clientLocation, setClientLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const router = useRouter();
  const { socket, isConnected } = useSocket();

  const MapWithNoSSR = useMemo(() => dynamic(() => import('@/components/LiveLocationMap'), {
    ssr: false,
    loading: () => <p className="text-center py-4">Loading map...</p>,
  }), []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchRequests = async () => {
      const res = await fetch('/api/deliveries', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      } else {
        const data = await res.json();
        setError(data.message);
      }
    };

    fetchRequests();
  }, [router]);

  useEffect(() => {
    let lastUpdate = 0;
    const updateInterval = 3000; // 3 seconds

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setRiderLocation({ latitude, longitude });

        const now = Date.now();
        if (socket && acceptedDelivery && (now - lastUpdate > updateInterval)) {
          socket.emit('rider_location_update', {
            deliveryId: acceptedDelivery.id,
            latitude,
            longitude,
          });
          lastUpdate = now;
        }
      },
      (error) => {
        console.error('Error getting user location:', error);
      },
      { enableHighAccuracy: true }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [socket, acceptedDelivery]);

  // Socket.IO listener for new delivery requests
  useEffect(() => {
    if (socket && isConnected) {
      socket.on('newDeliveryRequest', (newRequest: DeliveryRequest) => {
        // console.log('New delivery request received:', newRequest); // Removed this line
        setNewRequestAlert(newRequest);
        // Optionally, update the list of requests immediately
        // setRequests((prevRequests) => [newRequest, ...prevRequests]);
      });

      if (acceptedDelivery) {
        socket.emit('joinDeliveryRoom', acceptedDelivery.id);
        socket.on('client_location_broadcast', (data: { latitude: number; longitude: number }) => {
          setClientLocation(data);
        });
      }

      return () => {
        socket.off('newDeliveryRequest');
        if (acceptedDelivery) {
          socket.off('client_location_broadcast');
        }
      };
    }
  }, [socket, isConnected, acceptedDelivery]);

  const handleAcceptDelivery = async (request: DeliveryRequest) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`/api/deliveries/${request.id}/accept`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setAcceptedDelivery(request);
        // Optionally remove from available requests list
        setRequests(prev => prev.filter(r => r.id !== request.id));
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to accept delivery.');
      }
    } catch (err) {
      console.error('Error accepting delivery:', err);
      setError('An error occurred. Please try again.');
    }
  };

  const handleCompleteDelivery = () => {
    // Logic to inform the backend that the delivery is complete
    setAcceptedDelivery(null); // Clear accepted delivery
    setClientLocation(null); // Clear client location
    // Potentially refetch requests or update local state
  };

  const closeAlert = () => {
    setNewRequestAlert(null);
  };

  if (acceptedDelivery && riderLocation) {
    let pickupLocation = null;
    let destLocation = null;

    try {
        const parsedClient = typeof acceptedDelivery.clientLocation === 'string' 
            ? JSON.parse(acceptedDelivery.clientLocation) 
            : acceptedDelivery.clientLocation;
        const parsedDest = typeof acceptedDelivery.destination === 'string' 
            ? JSON.parse(acceptedDelivery.destination) 
            : acceptedDelivery.destination;

        pickupLocation = { latitude: parsedClient.lat, longitude: parsedClient.lng };
        destLocation = { latitude: parsedDest.lat, longitude: parsedDest.lng };
    } catch (e) {
        console.error("Error parsing locations", e);
    }

    return (
      <div className="relative min-h-screen w-full">
        <NoSSR>
          <MapWithNoSSR
            clientLocation={clientLocation}
            riderLocation={riderLocation}
            pickupLocation={pickupLocation}
            destinationLocation={destLocation}
            center={riderLocation}
          />
        </NoSSR>
        <div className="absolute top-4 left-4 right-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl z-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
            <Bike className="h-7 w-7 mr-2 text-blue-500" /> Delivery in Progress
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-1">
            <span className="font-semibold">Client:</span> {acceptedDelivery.client.name}
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            <span className="font-semibold">Destination:</span> {acceptedDelivery.destination}
          </p>
          <button
            onClick={handleCompleteDelivery}
            className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition duration-300 flex items-center justify-center"
          >
            <CheckCircle className="h-5 w-5 mr-2" /> Complete Delivery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Rider Dashboard</h1>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
          >
            Home
          </button>
        </div>
        {error && <p className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 p-3 rounded-md text-center mb-6">{error}</p>}

        {/* New Request Alert */}
        {newRequestAlert && (
          <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 p-6 mb-8 relative rounded-lg shadow-md" role="alert">
            <div className="flex items-center mb-3">
              <BellRing className="h-6 w-6 mr-3 text-yellow-600" />
              <p className="font-bold text-xl">New Delivery Request!</p>
            </div>
            <p className="mb-1">From: <span className="font-medium">{newRequestAlert.clientLocation}</span></p>
            <p className="mb-3">To: <span className="font-medium">{newRequestAlert.destination}</span></p>
            <p className="text-sm text-yellow-800 dark:text-yellow-300">Client: {newRequestAlert.client.name}</p>
            {newRequestAlert.description && <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-2">Notes: {newRequestAlert.description}</p>}
            
            <button
              onClick={closeAlert}
              className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
            <button 
              onClick={() => {
                const requestToAccept = requests.find(r => r.id === newRequestAlert.id) || newRequestAlert;
                handleAcceptDelivery(requestToAccept);
                closeAlert();
              }}
              className="w-full mt-5 bg-green-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-green-700 transition duration-300 flex items-center justify-center"
            >
              <CheckCircle className="h-5 w-5 mr-2" /> Accept Delivery
            </button>
          </div>
        )}

        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
          <Bike className="h-7 w-7 mr-3 text-blue-500" /> Available Deliveries
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.length > 0 ? (
            requests.map((req) => (
              <div key={req.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Delivery ID: {req.id.substring(0, 8)}...</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2"><span className="font-semibold">From:</span> {req.clientLocation}</p>
                <p className="text-gray-700 dark:text-gray-300 mb-4"><span className="font-semibold">To:</span> {req.destination}</p>
                {req.description && <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">Notes: {req.description}</p>}
                <div className="text-base text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="font-semibold">Client: {req.client.name}</p>
                  <p>Email: {req.client.email}</p>
                </div>
                <button 
                  onClick={() => handleAcceptDelivery(req)}
                  className="w-full mt-6 bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 mr-2" /> Accept Delivery
                </button>
              </div>
            ))
          ) : (
            <div className="md:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-700 dark:text-gray-300 text-lg">No pending delivery requests.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}