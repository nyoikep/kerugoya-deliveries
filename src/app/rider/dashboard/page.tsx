'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/contexts/SocketContext';
import dynamic from 'next/dynamic';
import { 
  MapPin, 
  Bike, 
  CheckCircle, 
  BellRing, 
  X, 
  Navigation, 
  User, 
  Phone, 
  Mail, 
  Clock,
  ChevronRight,
  TrendingUp,
  Award,
  LogOut
} from 'lucide-react';
import NoSSR from '@/components/NoSSR';

interface DeliveryRequest {
  id: string;
  clientLocation: any;
  destination: any;
  description: string | null;
  status: string;
  client: {
    name: string;
    email: string;
    phone?: string;
  };
}

export default function RiderDashboardPage() {
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [error, setError] = useState('');
  const [newRequestAlert, setNewRequestAlert] = useState<DeliveryRequest | null>(null);
  const [acceptedDelivery, setAcceptedDelivery] = useState<DeliveryRequest | null>(null);
  const [riderLocation, setRiderLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [clientLocation, setClientLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();
  const { socket, isConnected } = useSocket();

  const MapWithNoSSR = useMemo(() => dynamic(() => import('@/components/LiveLocationMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center">Loading live tracking...</div>,
  }), []);

  const parseLocation = (loc: any) => {
    if (typeof loc === 'string') {
      try {
        const parsed = JSON.parse(loc);
        return parsed.address || `${parsed.lat.toFixed(4)}, ${parsed.lng.toFixed(4)}`;
      } catch (e) {
        return loc;
      }
    }
    if (loc && typeof loc === 'object') {
       return loc.address || `${loc.lat?.toFixed(4)}, ${loc.lng?.toFixed(4)}`;
    }
    return 'Unknown Location';
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchRequests = async () => {
      try {
        const res = await fetch('/api/deliveries', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          // Filter out deliveries that are already accepted by others
          setRequests(data.filter((r: any) => r.status === 'PENDING'));
          
          // Check if I have an active delivery
          const active = data.find((r: any) => r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS');
          if (active) setAcceptedDelivery(active);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };

    fetchRequests();
  }, [router]);

  useEffect(() => {
    if (!isOnline) return;

    let lastUpdate = 0;
    const updateInterval = 5000;

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
      (error) => console.error('Geolocation error:', error),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [socket, acceptedDelivery, isOnline]);

  useEffect(() => {
    if (socket && isConnected && isOnline) {
      socket.on('newDeliveryRequest', (newRequest: DeliveryRequest) => {
        setNewRequestAlert(newRequest);
        setRequests(prev => [newRequest, ...prev]);
        // Play notification sound if possible
      });

      if (acceptedDelivery) {
        socket.emit('joinDeliveryRoom', acceptedDelivery.id);
        socket.on('client_location_broadcast', (data: { latitude: number; longitude: number }) => {
          setClientLocation(data);
        });
      }

      return () => {
        socket.off('newDeliveryRequest');
        if (acceptedDelivery) socket.off('client_location_broadcast');
      };
    }
  }, [socket, isConnected, acceptedDelivery, isOnline]);

  const handleAcceptDelivery = async (request: DeliveryRequest) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/deliveries/${request.id}/accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setAcceptedDelivery(request);
        setRequests(prev => prev.filter(r => r.id !== request.id));
        setNewRequestAlert(null);
      } else {
        const data = await res.json();
        setError(data.message || 'Someone else took this delivery.');
      }
    } catch (err) {
      setError('Connection error. Try again.');
    }
  };

  const handleCompleteDelivery = async () => {
    // In a real app, update DB status to 'COMPLETED'
    setAcceptedDelivery(null);
    setClientLocation(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (acceptedDelivery && riderLocation) {
    let pickupCoords = null;
    let destCoords = null;

    try {
      const pClient = typeof acceptedDelivery.clientLocation === 'string' ? JSON.parse(acceptedDelivery.clientLocation) : acceptedDelivery.clientLocation;
      const pDest = typeof acceptedDelivery.destination === 'string' ? JSON.parse(acceptedDelivery.destination) : acceptedDelivery.destination;
      pickupCoords = { latitude: pClient.lat, longitude: pClient.lng };
      destCoords = { latitude: pDest.lat, longitude: pDest.lng };
    } catch (e) {}

    return (
      <div className="relative min-h-screen bg-gray-950">
        <div className="absolute inset-0 z-0">
          <NoSSR>
            <MapWithNoSSR
              clientLocation={clientLocation}
              riderLocation={riderLocation}
              pickupLocation={pickupCoords}
              destinationLocation={destCoords}
              center={riderLocation}
            />
          </NoSSR>
        </div>
        
        {/* Active Delivery UI overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 md:p-8 pointer-events-none">
           <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-8 pointer-events-auto animate-in slide-in-from-bottom-8">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                       <Bike />
                    </div>
                    <div>
                       <h2 className="text-xl font-black">Active Delivery</h2>
                       <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">In Progress</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full text-xs font-black">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    LIVE
                 </div>
              </div>

              <div className="space-y-6 mb-8">
                 <div className="flex items-start gap-4">
                    <div className="mt-1 flex flex-col items-center">
                       <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                       <div className="w-0.5 h-10 bg-gray-200 dark:bg-gray-800 my-1"></div>
                       <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                    </div>
                    <div className="flex-grow">
                       <div className="mb-4">
                          <p className="text-[10px] font-black text-gray-400 uppercase">Pickup Location</p>
                          <p className="font-bold text-gray-900 dark:text-white">{parseLocation(acceptedDelivery.clientLocation)}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase">Destination</p>
                          <p className="font-bold text-gray-900 dark:text-white">{parseLocation(acceptedDelivery.destination)}</p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="pt-6 border-t dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                          <User size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-black">{acceptedDelivery.client.name}</p>
                          <p className="text-[10px] text-gray-500 font-bold">CLIENT</p>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-blue-600">
                          <Phone size={20} />
                       </button>
                    </div>
                 </div>
              </div>

              <button
                onClick={handleCompleteDelivery}
                className="w-full py-5 bg-green-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-green-600/20 hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Complete Delivery <CheckCircle />
              </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
      {/* Rider Header */}
      <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-40 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="bg-blue-600 p-2 rounded-xl shadow-lg">
                <Bike className="text-white h-6 w-6" />
             </div>
             <h1 className="text-2xl font-black hidden md:block">Rider Central</h1>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <span className={`text-xs font-black uppercase tracking-widest ${isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                   {isOnline ? 'Online' : 'Offline'}
                </span>
                <button 
                  onClick={() => setIsOnline(!isOnline)}
                  className={`w-12 h-6 rounded-full relative transition-all ${isOnline ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isOnline ? 'right-1' : 'left-1'}`}></div>
                </button>
             </div>
             <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                <LogOut size={20} />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                 <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Today\'s Earnings</p>
                 <h3 className="text-3xl font-black">Ksh 1,250</h3>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-2xl flex items-center justify-center">
                 <TrendingUp />
              </div>
           </div>
           <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                 <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Completed Trips</p>
                 <h3 className="text-3xl font-black">8</h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center">
                 <CheckCircle />
              </div>
           </div>
           <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                 <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Rider Rating</p>
                 <h3 className="text-3xl font-black">4.9</h3>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-2xl flex items-center justify-center">
                 <Award />
              </div>
           </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-center font-bold">
            {error}
          </div>
        )}

        {/* Available Requests */}
        <div className="space-y-6">
           <h2 className="text-2xl font-black flex items-center gap-3">
             <BellRing className="text-blue-600" /> New Delivery Requests
           </h2>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {requests.map((req) => (
                <div key={req.id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800 group hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900/30 transition-all duration-500 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                   
                   <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                         <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-black uppercase tracking-widest">
                            #ID-{req.id.substring(0, 6)}
                         </div>
                         <div className="text-right">
                            <p className="text-2xl font-black text-gray-900 dark:text-white">Ksh 350</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Est. Payout</p>
                         </div>
                      </div>

                      <div className="space-y-4 mb-8">
                         <div className="flex items-start gap-4">
                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                               <Navigation size={14} />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5">Pickup</p>
                               <p className="font-bold text-gray-900 dark:text-white line-clamp-1">{parseLocation(req.clientLocation)}</p>
                            </div>
                         </div>
                         <div className="flex items-start gap-4">
                            <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                               <MapPin size={14} />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5">Destination</p>
                               <p className="font-bold text-gray-900 dark:text-white line-clamp-1">{parseLocation(req.destination)}</p>
                            </div>
                         </div>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t dark:border-gray-800">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                               <User size={20} className="text-gray-400" />
                            </div>
                            <div>
                               <p className="text-sm font-black">{req.client.name}</p>
                               <p className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                                  <Clock size={10} /> 3 min away
                               </p>
                            </div>
                         </div>
                         <button 
                           onClick={() => handleAcceptDelivery(req)}
                           className="px-8 py-3 bg-black dark:bg-blue-600 text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                         >
                           ACCEPT
                         </button>
                      </div>
                   </div>
                </div>
              ))}

              {requests.length === 0 && (
                <div className="lg:col-span-2 py-24 bg-white dark:bg-gray-900 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800 text-center">
                   <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Clock size={32} className="text-gray-300" />
                   </div>
                   <h3 className="text-xl font-black mb-2">Waiting for new requests...</h3>
                   <p className="text-gray-500 max-w-xs mx-auto">Stay online to receive delivery requests in your area. Good luck!</p>
                </div>
              )}
           </div>
        </div>
      </main>

      {/* Persistent New Request Alert (Uber style) */}
      {newRequestAlert && (
         <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95">
               <div className="bg-blue-600 p-8 text-white text-center relative">
                  <div className="absolute top-4 right-4">
                     <button onClick={() => setNewRequestAlert(null)} className="p-2 hover:bg-white/20 rounded-full transition-all">
                        <X size={24} />
                     </button>
                  </div>
                  <div className="w-24 h-24 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/30 animate-bounce">
                     <Bike size={48} />
                  </div>
                  <h3 className="text-3xl font-black mb-2">New Delivery!</h3>
                  <p className="text-blue-100 font-bold text-lg uppercase tracking-widest">Ksh 450 Estimated Payout</p>
               </div>
               <div className="p-10 space-y-8">
                  <div className="space-y-6">
                     <div className="flex items-start gap-5">
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                           <Navigation />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pickup from</p>
                           <p className="text-xl font-bold">{parseLocation(newRequestAlert.clientLocation)}</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-5">
                        <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/30 text-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                           <MapPin />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Deliver to</p>
                           <p className="text-xl font-bold">{parseLocation(newRequestAlert.destination)}</p>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex gap-4">
                     <button 
                       onClick={() => setNewRequestAlert(null)}
                       className="flex-1 py-5 bg-gray-100 dark:bg-gray-800 text-gray-500 font-black text-lg rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                     >
                        DECLINE
                     </button>
                     <button 
                       onClick={() => handleAcceptDelivery(newRequestAlert)}
                       className="flex-[2] py-5 bg-blue-600 text-white font-black text-lg rounded-3xl hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-600/20"
                     >
                        ACCEPT RIDE
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}