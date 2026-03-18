'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [pickupLocation, setPickupLocation] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const router = useRouter();

  const handleRequestRide = () => {
    // For now, we'll just pass the string values. Later, these would be coordinates.
    const query = new URLSearchParams();
    if (pickupLocation) query.append('pickup', pickupLocation);
    if (destinationLocation) query.append('destination', destinationLocation);
    router.push(`/new-delivery?${query.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center text-center bg-cover bg-center" style={{ backgroundImage: "url('/pexels-bruce-byereta-422939715-31961615.jpg')" }}>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
            Go Anywhere with Kerugoya
          </h1>
          <p className="text-lg md:text-2xl text-white mb-8">
            Request a ride, order a delivery. Your city is in your hands.
          </p>

          {/* Booking Widget */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl max-w-2xl mx-auto text-left">
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                placeholder="Enter pickup location"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none"
              />
              <input 
                type="text" 
                placeholder="Enter destination"
                value={destinationLocation}
                onChange={(e) => setDestinationLocation(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none"
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <button 
                onClick={handleRequestRide}
                className="w-full text-center px-6 py-3 bg-black text-white font-bold rounded-md hover:bg-gray-800 transition duration-300"
              >
                Request a Ride
              </button>
              <Link href="/shop" className="w-full text-center px-6 py-3 bg-gray-200 text-black font-bold rounded-md hover:bg-gray-300 transition duration-300">
                Order a Delivery
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

