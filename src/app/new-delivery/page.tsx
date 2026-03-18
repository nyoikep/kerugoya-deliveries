'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart, MapPin, CreditCard, Bike } from 'lucide-react'; // Assuming lucide-react is installed

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
  const [error, setError] = useState('');
  const [step, setStep] = useState<CheckoutStep>('pickup');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartItems, clearCart, getTotalPrice, isHydrated } = useCart();

  const initialPickup = searchParams.get('pickup');
  const initialDestination = searchParams.get('destination');

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
      case 'pickup': return 'Step 1: Confirm Pickup Location';
      case 'destination': return 'Step 2: Confirm Destination Location';
      case 'select-rider': return 'Step 3: Select a Rider';
      default: return 'New Delivery Request';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
          {getStepTitle()}
        </h2>
        {error && <p className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 p-3 rounded-md text-center mb-6">{error}</p>}
        
        {/* Cart Review - shown on all steps */}
        <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-inner">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <ShoppingCart className="h-6 w-6 mr-2 text-blue-500" /> Review Your Order
          </h3>
          {cartItems.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center">
              No items in cart. Please add items from the{' '}
              <Link href="/shop" className="text-blue-600 hover:underline dark:text-blue-400">
                Shop
              </Link>
              .
            </p>
          ) : (
            <>
              <ul className="divide-y divide-gray-200 dark:divide-gray-600 mb-4">
                {cartItems.map((item) => (
                  <li key={item.id} className="flex justify-between items-center py-3">
                    <span className="text-gray-800 dark:text-gray-200 break-words pr-2">
                      {item.name} (x{item.quantity})
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600 font-bold text-lg">
                <span className="text-gray-900 dark:text-gray-100">Total Cart Price:</span>
                <span className="text-blue-600 dark:text-blue-400">${getTotalPrice().toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        <form onSubmit={step === 'select-rider' ? handleSubmit : handleNextStep}>
          {step === 'pickup' && (
            <div className="mb-8">
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-3 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-green-500" /> Select Your Pickup Location
              </label>
              <div className="h-96 w-full rounded-lg shadow-md overflow-hidden">
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
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-3 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-orange-500" /> Select Your Destination Location
              </label>
              <div className="h-96 w-full rounded-lg shadow-md overflow-hidden">
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
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-3 flex items-center">
                <Bike className="h-6 w-6 mr-2 text-blue-500" /> Select an Available Rider
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableRiders.length > 0 ? (
                  availableRiders.map((rider) => (
                    <div
                      key={rider.id}
                      onClick={() => setSelectedRiderId(rider.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedRiderId === rider.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <h4 className="font-bold text-gray-900 dark:text-gray-100">{rider.name}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{rider.phone}</p>
                      {selectedRiderId === rider.id && (
                        <p className="mt-2 text-blue-600 dark:text-blue-400 font-bold">
                          Plate: {rider.motorcyclePlateNumber}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center col-span-2">No riders available in the area.</p>
                )}
              </div>
              {availableRiders.find(r => r.id === selectedRiderId) && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg text-center">
                  <p className="text-green-800 dark:text-green-200 font-semibold">
                    You have selected {availableRiders.find(r => r.id === selectedRiderId)?.name}.
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-2">
                    Plate: {availableRiders.find(r => r.id === selectedRiderId)?.motorcyclePlateNumber}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between mt-6">
            {step !== 'pickup' && (
              <button
                type="button"
                onClick={() => setStep(step === 'select-rider' ? 'destination' : 'pickup')}
                className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-lg shadow-md hover:bg-gray-400 dark:hover:bg-gray-700 transition duration-300"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              className={`px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                (step === 'select-rider' && !selectedRiderId) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={step === 'select-rider' && !selectedRiderId}
              style={{ marginLeft: step === 'pickup' ? '0' : 'auto' }}
            >
              {step === 'select-rider' ? 'Confirm Rider & Request Ride' : 'Next Step'}
            </button>
          </div>
        </form>
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
