'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart, MapPin, CreditCard, Bike, Clock, Navigation, ShoppingBag, Award, CheckCircle2 } from 'lucide-react'; // Assuming lucide-react is installed

import NoSSR from '@/components/NoSSR'; // Import NoSSR component

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

type CheckoutStep = 'pickup' | 'destination' | 'select-rider';

interface Rider {
  id: string;
  name: string;
  phone: string;
  motorcyclePlateNumber: string;
}

function NewDeliveryContent() {
  const [pickupLocation, setPickupLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [availableRiders, setAvailableRiders] = useState<Rider[]>([]);
  const [selectedRiderId, setSelectedRiderId] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [isExpress, setIsExpress] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [estimatedDistance, setEstimatedDistance] = useState<number | null>(null);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState<CheckoutStep>('pickup');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartItems, clearCart, getTotalPrice, isHydrated } = useCart();

  const initialPickup = searchParams.get('pickup');
  const initialDestination = searchParams.get('destination');

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await fetch('/api/user', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setUser(await res.json());
      }
    };
    fetchUser();
    
    if (searchParams.get('scheduled') === 'true') {
      setIsScheduled(true);
    }
  }, [searchParams]);

  // Pricing constants (Mirroring Backend)
  const PLATFORM_FEE_PERCENT = 0.10;
  const EXPRESS_FEE = 100;
  
  const currentHour = new Date().getHours();
  const isPeakHour = currentHour >= 17 && currentHour <= 20;
  const surgeMultiplier = isPeakHour ? 1.5 : 1.0;

  // Calculate distance and price
  useEffect(() => {
    if (pickupLocation && destinationLocation && window.google) {
      const pickup = new google.maps.LatLng(pickupLocation.lat, pickupLocation.lng);
      const destination = new google.maps.LatLng(destinationLocation.lat, destinationLocation.lng);
      const distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(pickup, destination);
      const distanceInKm = distanceInMeters / 1000;
      
      setEstimatedDistance(distanceInKm);
      
      const baseFare = 150 + (cartItems.length * 20);
      const surgePrice = baseFare * surgeMultiplier;
      const platformFee = user?.isGold ? 0 : (baseFare * PLATFORM_FEE_PERCENT);
      const expressFee = isExpress ? EXPRESS_FEE : 0;
      
      setEstimatedPrice(surgePrice + platformFee + expressFee + Number(tipAmount));
    }
  }, [pickupLocation, destinationLocation, isExpress, tipAmount, user, cartItems, surgeMultiplier]);

  // Simulated driver data - place around Kerugoya
  const simulatedDrivers = useMemo(() => ([
    { id: 'driver1', lat: -0.505, lng: 37.285 },
    { id: 'driver2', lat: -0.510, lng: 37.280 },
    { id: 'driver3', lat: -0.498, lng: 39.290 },
  ]), []);

  useEffect(() => {
    if (step === 'select-rider') {
      const fetchRiders = async () => {
        try {
          const res = await fetch('/api/riders');
          if (res.ok) {
            const data = await res.json();
            setAvailableRiders(data);
          }
        } catch (err) {
          console.error('Error fetching riders:', err);
        }
      };
      fetchRiders();
    }
  }, [step]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pickupLocation || !destinationLocation) {
      setError('Please select both pickup and destination locations.');
      setStep('pickup');
      return;
    }

    if (isScheduled && !scheduledAt) {
      setError('Please select a date and time for your scheduled ride.');
      return;
    }

    if (!selectedRiderId) {
      setError('Please select a rider.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const res = await fetch('/api/deliveries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        cartItems,
        clientLocation: pickupLocation,
        destination: destinationLocation,
        riderId: selectedRiderId,
        scheduledAt: isScheduled ? scheduledAt : null,
        isExpress,
        tipAmount,
      }),
    });

    if (res.ok) {
      const selectedRider = availableRiders.find(r => r.id === selectedRiderId);
      alert(`Delivery request created! Your rider is ${selectedRider?.name} (${selectedRider?.motorcyclePlateNumber}). You will pay the rider directly upon delivery.`);
      clearCart();
      router.push('/dashboard');
    } else {
      const data = await res.json();
      setError(data.message);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (step === 'pickup') {
      if (!pickupLocation) {
        setError('Please select a pickup location on the map before proceeding.');
        return;
      }
      setStep('destination');
    } else if (step === 'destination') {
      if (!destinationLocation) {
        setError('Please select a destination location on the map before proceeding.');
        return;
      }
      setStep('select-rider');
    }
  };

  if (!isHydrated) {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 flex items-center justify-center">
            <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl text-center">
                <p>Loading your request...</p>
            </div>
        </div>
    );
  }

  const getStepTitle = () => {
    switch (step) {
      case 'pickup': return 'Confirm Pickup Location';
      case 'destination': return 'Confirm Destination Location';
      case 'select-rider': return 'Select a Rider';
      default: return 'New Delivery Request';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 flex items-center justify-center font-sans">
      <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-2xl border dark:border-gray-700">
        <div className="flex justify-between items-center mb-10">
           <div className="flex items-center gap-4">
              <h2 className="text-4xl font-black text-gray-900 dark:text-gray-100">
                {getStepTitle()}
              </h2>
              {user?.isGold && (
                <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-black rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                   <Award className="h-3 w-3" /> GOLD MEMBER
                </span>
              )}
           </div>
           <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
              <button 
                type="button"
                onClick={() => setIsScheduled(false)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${!isScheduled ? 'bg-white dark:bg-gray-600 shadow-sm text-black dark:text-white' : 'text-gray-500'}`}
              >
                Now
              </button>
              <button 
                type="button"
                onClick={() => setIsScheduled(true)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${isScheduled ? 'bg-white dark:bg-gray-600 shadow-sm text-black dark:text-white' : 'text-gray-500'}`}
              >
                Schedule
              </button>
           </div>
        </div>

        {error && <p className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 p-4 rounded-xl text-center mb-8 font-bold animate-shake">{error}</p>}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <form onSubmit={step === 'select-rider' ? handleSubmit : handleNextStep}>

              {step === 'pickup' && (
                <div className="mb-8">
                  <div className="h-[500px] w-full rounded-3xl shadow-lg overflow-hidden border dark:border-gray-700">
                    <NoSSR>
                      <MapPicker 
                        mode="pickup"
                        otherLocation={destinationLocation ? { lat: destinationLocation.lat, lng: destinationLocation.lng } : null}
                        onLocationSelect={setPickupLocation} 
                        initialPickupSearch={initialPickup || undefined} 
                      />
                    </NoSSR>
                  </div>
                </div>
              )}

              {step === 'destination' && (
                <div className="mb-8">
                  <div className="h-[500px] w-full rounded-3xl shadow-lg overflow-hidden border dark:border-gray-700">
                    <NoSSR>
                      <MapPicker 
                        mode="destination"
                        otherLocation={pickupLocation ? { lat: pickupLocation.lat, lng: pickupLocation.lng } : null}
                        onLocationSelect={setDestinationLocation} 
                        initialDestinationSearch={initialDestination || undefined} 
                      />
                    </NoSSR>
                  </div>
                </div>
              )}

              {step === 'select-rider' && (
                <div className="mb-8">
                  {/* Prominent Price Display */}
                  <div className="mb-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-3xl border-2 border-green-200 dark:border-green-800 flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-500">
                    <div>
                      <p className="text-xs font-black text-green-700 dark:text-green-300 uppercase tracking-widest mb-1">Estimated Journey Price</p>
                      <h3 className="text-3xl font-black text-gray-900 dark:text-white">Ksh {(estimatedPrice || 0).toLocaleString()}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Distance</p>
                      <p className="text-xl font-bold dark:text-gray-200">{estimatedDistance?.toFixed(1)} km</p>
                    </div>
                  </div>

                  {isScheduled && (
                    <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                      <label className="block text-sm font-black text-blue-900 dark:text-blue-100 uppercase mb-3 flex items-center">
                        <Clock className="h-4 w-4 mr-2" /> Schedule Your Trip
                      </label>
                      <input 
                        type="datetime-local" 
                        required={isScheduled}
                        value={scheduledAt || ''}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="w-full px-4 py-4 bg-white dark:bg-gray-700 border-2 border-blue-200 dark:border-blue-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                      />
                    </div>
                  )}

                  {/* Monetization Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                     <div 
                       onClick={() => setIsExpress(!isExpress)}
                       className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${isExpress ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md' : 'border-gray-100 dark:border-gray-800'}`}
                     >
                        <div className="flex justify-between items-center mb-2">
                           <h4 className="font-black text-gray-900 dark:text-white">Express Delivery</h4>
                           <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isExpress ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                              {isExpress && <CheckCircle2 className="h-3 w-3 text-white" />}
                           </div>
                        </div>
                        <p className="text-xs text-gray-500 font-bold mb-3">Jump the queue. Get matched with a rider instantly.</p>
                        <p className="font-black text-blue-600">+ Ksh 100</p>
                     </div>

                     <div className="p-6 rounded-2xl border-2 border-gray-100 dark:border-gray-800">
                        <h4 className="font-black text-gray-900 dark:text-white mb-2">Tip Your Rider</h4>
                        <p className="text-xs text-gray-500 font-bold mb-3">100% of tips go to your rider. Thank them for great service!</p>
                        <div className="flex items-center gap-2">
                           {[20, 50, 100].map(amt => (
                             <button 
                               key={amt}
                               type="button"
                               onClick={() => setTipAmount(amt === tipAmount ? 0 : amt)}
                               className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${tipAmount === amt ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                             >
                                Ksh {amt}
                             </button>
                           ))}
                           <input 
                             type="number" 
                             placeholder="Other"
                             className="w-full px-3 py-1 bg-transparent border-b-2 border-gray-200 dark:border-gray-700 outline-none text-sm font-bold"
                             value={tipAmount || ''}
                             onChange={(e) => setTipAmount(Number(e.target.value))}
                           />
                        </div>
                     </div>
                  </div>

                  <label className="block text-xl font-black text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                    <Bike className="h-6 w-6 mr-2 text-blue-500" /> Choose your ride
                  </label>
                  <div className="space-y-4">
                    {availableRiders.length > 0 ? (
                      availableRiders.map((rider) => (
                        <div
                          key={rider.id}
                          onClick={() => setSelectedRiderId(rider.id)}
                          className={`p-6 border-2 rounded-2xl cursor-pointer transition-all flex items-center justify-between group ${
                            selectedRiderId === rider.id
                              ? 'border-black dark:border-blue-500 bg-gray-50 dark:bg-blue-900/30 ring-4 ring-black/5'
                              : 'border-gray-100 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                             <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-xl group-hover:scale-110 transition-transform">
                                <Bike className="h-8 w-8 text-black dark:text-white" />
                             </div>
                             <div>
                                <h4 className="font-black text-xl text-gray-900 dark:text-gray-100">{rider.name}</h4>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-bold">{rider.motorcyclePlateNumber}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="font-black text-xl">Ksh {(getTotalPrice() + (estimatedPrice || 0)).toLocaleString()}</p>
                             <p className="text-xs text-gray-400 font-bold">Estimated Total</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center bg-gray-50 dark:bg-gray-700/50 rounded-3xl">
                        <p className="text-gray-500 dark:text-gray-400 font-bold italic">Searching for nearby riders...</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-10">
                {step !== 'pickup' ? (
                  <button
                    type="button"
                    onClick={() => setStep(step === 'select-rider' ? 'destination' : 'pickup')}
                    className="px-8 py-4 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-black rounded-2xl shadow-md hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300"
                  >
                    Back
                  </button>
                ) : <div />}
                <button
                  type="submit"
                  className={`px-12 py-4 bg-black dark:bg-blue-600 text-white font-black text-lg rounded-2xl shadow-xl hover:scale-[1.05] active:scale-[0.95] transition duration-300 focus:outline-none ${
                    (step === 'select-rider' && !selectedRiderId) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={step === 'select-rider' && !selectedRiderId}
                >
                  {step === 'select-rider' ? 'Book Kerugoya Ride' : 'Next Step'}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* Trip Details Summary */}
            <div className="p-8 bg-gray-900 text-white rounded-[2rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Navigation className="h-32 w-32" />
              </div>
              <h3 className="text-2xl font-black mb-6 flex items-center relative z-10">
                Trip Summary
              </h3>
              
              <div className="space-y-6 relative z-10">
                <div className="flex items-start space-x-4">
                  <div className="mt-1 h-3 w-3 bg-white rounded-full flex-shrink-0"></div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Pickup</p>
                    <p className="font-bold truncate max-w-[180px]">{pickupLocation ? 'Location Selected' : 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="mt-1 h-3 w-3 bg-blue-500 rounded-sm flex-shrink-0"></div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Destination</p>
                    <p className="font-bold truncate max-w-[180px]">{destinationLocation ? 'Location Selected' : 'Not set'}</p>
                  </div>
                </div>

                {estimatedDistance && (
                  <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Distance</p>
                      <p className="text-lg font-black">{estimatedDistance.toFixed(1)} km</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Est. Time</p>
                      <p className="text-lg font-black">{Math.ceil(estimatedDistance * 3)} min</p>
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">Base + Surge</span>
                    <span className="font-bold">Ksh {(150 + cartItems.length * 20) * surgeMultiplier}</span>
                  </div>
                  {isPeakHour && (
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-orange-400 text-[10px] font-black uppercase">Peak Hour Pricing (1.5x)</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">Platform Fee</span>
                    <span className={`font-bold ${user?.isGold ? 'text-green-400' : ''}`}>{user?.isGold ? 'FREE' : `Ksh ${(150 + cartItems.length * 20) * PLATFORM_FEE_PERCENT}`}</span>
                  </div>
                  {isExpress && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-blue-400 text-sm font-bold flex items-center"><CheckCircle2 className="h-3 w-3 mr-1" /> Express Fee</span>
                      <span className="font-bold">Ksh {EXPRESS_FEE}</span>
                    </div>
                  )}
                  {tipAmount > 0 && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-green-400 text-sm font-bold">Rider Tip</span>
                      <span className="font-bold">Ksh {tipAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-2 pt-2 border-t border-white/5">
                    <span className="text-gray-400 text-sm">Cart Items</span>
                    <span className="font-bold">Ksh {getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <span className="text-white font-black text-lg">Total</span>
                    <span className="text-3xl font-black text-blue-400">Ksh {(getTotalPrice() + (estimatedPrice || 0)).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cart Summary Card */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-[2rem] border-2 border-gray-100 dark:border-gray-700 shadow-sm">
               <h4 className="font-black text-xl mb-4 flex items-center">
                 <ShoppingBag className="h-5 w-5 mr-2 text-blue-500" /> Items ({cartItems.length})
               </h4>
               <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                       <span className="text-gray-600 dark:text-gray-400">{item.name} x{item.quantity}</span>
                       <span className="font-bold">Ksh {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  {cartItems.length === 0 && <p className="text-gray-400 italic text-sm">Cart is empty</p>}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewDeliveryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewDeliveryContent />
    </Suspense>
  );
}
