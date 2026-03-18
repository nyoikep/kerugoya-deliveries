'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Added import for Link
import { jwtDecode } from 'jwt-decode';
import { useSocket } from '@/contexts/SocketContext';
import dynamic from 'next/dynamic';
import { MapPin, Bike, Star, X } from 'lucide-react'; // Assuming lucide-react is installed

import NoSSR from '@/components/NoSSR';

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface CartItem {
  id:string;
  productId: string;
  product: Product;
  quantity: number;
}

interface DeliveryRequest {
  id: string;
  cartItems: CartItem[];
  status: string;
  createdAt: string;
  riderId?: string;
  clientLocation: any;
  destination: any;
}

interface RiderDetails {
  name: string;
  phone: string;
  numberPlate: string;
}

export default function TrackOrderPage() {
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedRiderId, setSelectedRiderId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [riderDetails, setRiderDetails] = useState<Record<string, RiderDetails>>({});
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [riderLocations, setRiderLocations] = useState<Record<string, { latitude: number; longitude: number }>>({});
  const router = useRouter();
  const { socket } = useSocket();

  const MapWithNoSSR = useMemo(() => dynamic(() => import('@/components/LiveLocationMap'), {
    ssr: false,
    loading: () => <p className="text-center py-4">Loading map...</p>,
  }), []);

  useEffect(() => {
    const fetchDeliveryRequests = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('/api/deliveries', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        setDeliveryRequests(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryRequests();
  }, [router]);

  useEffect(() => {
    if (socket) {
      deliveryRequests.forEach((request) => {
        // Clients should always be in the room for their requests to receive updates
        socket.emit('joinDeliveryRoom', request.id);
      });

      socket.on('rideAccepted', (data: { deliveryId: string; riderDetails: RiderDetails }) => {
        setRiderDetails((prev) => ({
          ...prev,
          [data.deliveryId]: data.riderDetails,
        }));
        // Update the status of the request locally to trigger the map view
        setDeliveryRequests(prev => prev.map(req => 
          req.id === data.deliveryId ? { ...req, status: 'ACCEPTED' } : req
        ));
      });

      socket.on('rider_location_broadcast', (data: { latitude: number; longitude: number; deliveryId?: string }) => {
        // If deliveryId is provided in broadcast, use it, otherwise find first active
        const targetId = data.deliveryId || deliveryRequests.find(req => req.status === 'ACCEPTED' || req.status === 'IN_PROGRESS')?.id;
        
        if (targetId) {
          setRiderLocations((prev) => ({
            ...prev,
            [targetId]: { latitude: data.latitude, longitude: data.longitude },
          }));
        }
      });

      return () => {
        socket.off('rideAccepted');
        socket.off('rider_location_broadcast');
      };
    }
  }, [socket, deliveryRequests]);

  useEffect(() => {
    let lastUpdate = 0;
    const updateInterval = 3000; // 3 seconds

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });

        const now = Date.now();
        if (socket && (now - lastUpdate > updateInterval)) {
          deliveryRequests.forEach((request) => {
            if (request.status === 'ACCEPTED' || request.status === 'IN_PROGRESS') {
              const token = localStorage.getItem('token');
              if (token) {
                socket.emit('client_location_update', {
                  deliveryId: request.id,
                  latitude,
                  longitude,
                });
              }
            }
          });
          lastUpdate = now;
        }
      },
      (error) => {
        // console.error('Error getting user location:', error.message, error); // Removed this line
      },
      { enableHighAccuracy: true }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [socket, deliveryRequests]);


  const handleOpenRatingModal = (riderId: string) => {
    setSelectedRiderId(riderId);
    setIsRatingModalOpen(true);
  };

  const handleCloseRatingModal = () => {
    setSelectedRiderId(null);
    setIsRatingModalOpen(false);
    setRating(0);
    setComment('');
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token || !selectedRiderId) return;

    const decodedToken: { userId: string } = jwtDecode(token);
    const clientId = decodedToken.userId;

    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          comment,
          riderId: selectedRiderId,
          clientId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      alert('Rating submitted successfully!');
      handleCloseRatingModal();
    } catch (error) {
      console.error(error);
      alert('Failed to submit rating');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-gray-700 dark:text-gray-300">Loading delivery requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">Track Your Deliveries</h1>
        {deliveryRequests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No active delivery requests found.</p>
            <Link href="/shop" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300">
              Start a New Order
            </Link>
          </div>
        ) : (
          <div className="grid gap-8">
            {deliveryRequests.map((request) => (
              <div key={request.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4 border-b pb-4 border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-blue-500" /> Request ID: {request.id.substring(0, 8)}...
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    request.status === 'DELIVERED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                    request.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                    request.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                    request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Products Ordered:</p>
                  <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300">
                    {request.cartItems.map((item) => (
                      <li key={item.id} className="mb-1">
                        {item.product.name} (x{item.quantity}) - Ksh{item.product.price.toFixed(2)} each
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-gray-700 dark:text-gray-300">
                    Requested On: <span className="font-medium">{new Date(request.createdAt).toLocaleString()}</span>
                  </p>
                </div>

                {riderDetails[request.id] && (
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-inner">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                      <Bike className="h-5 w-5 mr-2 text-green-500" /> Rider Details:
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">Name: <span className="font-medium">{riderDetails[request.id].name}</span></p>
                    <p className="text-gray-700 dark:text-gray-300">Phone: <span className="font-medium">{riderDetails[request.id].phone}</span></p>
                    <p className="text-gray-700 dark:text-gray-300">Number Plate: <span className="font-medium">{riderDetails[request.id].numberPlate}</span></p>
                  </div>
                )}

                {(request.status === 'ACCEPTED' || request.status === 'IN_PROGRESS') && userLocation && riderLocations[request.id] && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <MapPin className="h-6 w-6 mr-2 text-blue-500" /> Live Tracking
                    </h3>
                    <div style={{ height: '400px', width: '100%' }} className="rounded-lg overflow-hidden shadow-md">
                      <NoSSR>
                        <MapWithNoSSR
                          clientLocation={userLocation}
                          riderLocation={riderLocations[request.id]}
                          pickupLocation={{ 
                            latitude: typeof request.clientLocation === 'string' ? JSON.parse(request.clientLocation).lat : request.clientLocation.lat,
                            longitude: typeof request.clientLocation === 'string' ? JSON.parse(request.clientLocation).lng : request.clientLocation.lng
                          }}
                          destinationLocation={{ 
                            latitude: typeof request.destination === 'string' ? JSON.parse(request.destination).lat : request.destination.lat,
                            longitude: typeof request.destination === 'string' ? JSON.parse(request.destination).lng : request.destination.lng
                          }}
                          center={userLocation}
                        />
                      </NoSSR>
                    </div>
                  </div>
                )}

                {request.status === 'DELIVERED' && request.riderId && (
                  <div className="mt-6 text-right">
                    <button
                      onClick={() => handleOpenRatingModal(request.riderId!)}
                      className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition duration-300"
                    >
                      Rate Rider
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isRatingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="relative bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl max-w-md w-full">
            <button
              onClick={handleCloseRatingModal}
              className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">Rate Your Rider</h3>
            <form onSubmit={handleRatingSubmit}>
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, index) => {
                  const ratingValue = index + 1;
                  return (
                    <Star
                      key={ratingValue}
                      onClick={() => setRating(ratingValue)}
                      className={`h-10 w-10 cursor-pointer transition-colors duration-200 ${
                        ratingValue <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  );
                })}
              </div>
              <div className="mb-6">
                <label htmlFor="comment" className="sr-only">Comment</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience (optional)..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                ></textarea>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  Submit Rating
                </button>
                <button
                  type="button"
                  onClick={handleCloseRatingModal}
                  className="w-full bg-gray-300 text-gray-800 font-bold py-3 rounded-lg shadow-md hover:bg-gray-400 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
