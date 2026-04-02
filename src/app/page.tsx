'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bike, Clock, Smartphone, MapPin, Navigation, ShoppingBag, ChevronRight, Download } from 'lucide-react';

export default function HomePage() {
  const [pickupLocation, setPickupLocation] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [requestType, setRequestType] = useState<'now' | 'later'>('now');
  const router = useRouter();

  const handleRequestRide = () => {
    const query = new URLSearchParams();
    if (pickupLocation) query.append('pickup', pickupLocation);
    if (destinationLocation) query.append('destination', destinationLocation);
    if (requestType === 'later') query.append('scheduled', 'true');
    router.push(`/new-delivery?${query.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/pexels-bruce-byereta-422939715-31961615.jpg')" }}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>
        
        <div className="relative z-10 w-full max-w-6xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left text-white">
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              Request a ride <br /> for now or later
            </h1>
            <p className="text-xl md:text-2xl mb-8 font-medium text-gray-200">
              Add your trip details, hop in, and go. <br /> Your city, simplified.
            </p>
            
            <div className="hidden lg:flex items-center space-x-4 mt-12 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 w-fit">
               <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                  <Smartphone className="h-8 w-8 text-white" />
               </div>
               <div>
                  <p className="font-bold text-lg">Do more in the app</p>
                  <p className="text-sm text-gray-300">Download the Kerugoya-deliveries app</p>
               </div>
            </div>
          </div>

          {/* Booking Widget */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-md mx-auto lg:ml-auto">
            <div className="flex space-x-2 mb-8 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
              <button 
                onClick={() => setRequestType('now')}
                className={`flex-1 py-3 rounded-lg font-bold transition-all flex items-center justify-center ${requestType === 'now' ? 'bg-white dark:bg-gray-600 shadow-md text-black dark:text-white' : 'text-gray-500'}`}
              >
                <Navigation className="h-4 w-4 mr-2" /> Pick up now
              </button>
              <button 
                onClick={() => setRequestType('later')}
                className={`flex-1 py-3 rounded-lg font-bold transition-all flex items-center justify-center ${requestType === 'later' ? 'bg-white dark:bg-gray-600 shadow-md text-black dark:text-white' : 'text-gray-500'}`}
              >
                <Clock className="h-4 w-4 mr-2" /> Schedule later
              </button>
            </div>

            <div className="space-y-4 relative">
              <div className="absolute left-6 top-[3.5rem] bottom-[3.5rem] w-0.5 bg-gray-200 dark:bg-gray-600"></div>
              
              <div className="relative flex items-center">
                <div className="z-10 bg-gray-900 dark:bg-white h-3 w-3 rounded-full mr-4 ml-4.5"></div>
                <input 
                  type="text" 
                  placeholder="Enter pickup location"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                />
                <MapPin className="absolute left-4 h-5 w-5 text-gray-400" />
              </div>

              <div className="relative flex items-center">
                <div className="z-10 bg-blue-600 h-3 w-3 rounded-sm mr-4 ml-4.5"></div>
                <input 
                  type="text" 
                  placeholder="Enter destination"
                  value={destinationLocation}
                  onChange={(e) => setDestinationLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                />
                <MapPin className="absolute left-4 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <button 
              onClick={handleRequestRide}
              className="w-full mt-8 py-4 bg-black dark:bg-blue-600 text-white font-black text-lg rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl flex items-center justify-center"
            >
              See prices <ChevronRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-black mb-12">Ride with confidence</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group cursor-pointer">
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-3xl mb-6 overflow-hidden relative">
               <Image src="/pexels-mcgzay-30661393.jpg" alt="Ride" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <h3 className="text-2xl font-black mb-2 flex items-center">Ride <ChevronRight className="ml-1 h-5 w-5" /></h3>
            <p className="text-gray-600 dark:text-gray-400">Request a ride now or for later, and travel across Kerugoya with ease.</p>
          </div>
          
          <div className="group cursor-pointer">
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-3xl mb-6 overflow-hidden relative">
               <Image src="/pexels-odonti-photography-661992921-27999926.jpg" alt="Delivery" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <h3 className="text-2xl font-black mb-2 flex items-center">Package <ChevronRight className="ml-1 h-5 w-5" /></h3>
            <p className="text-gray-600 dark:text-gray-400">Send packages to friends and family across the city in minutes.</p>
          </div>

          <div className="group cursor-pointer">
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-3xl mb-6 overflow-hidden relative">
               <Image src="/pexels-clayton-943956-11206901.jpg" alt="Shop" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <h3 className="text-2xl font-black mb-2 flex items-center">Shop <ChevronRight className="ml-1 h-5 w-5" /></h3>
            <p className="text-gray-600 dark:text-gray-400">Order from your favorite local stores and have it delivered to your doorstep.</p>
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="bg-gray-50 dark:bg-gray-800/50 py-24 px-6 border-y dark:border-gray-700">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Do more in the app</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Download the Kerugoya-deliveries app for a complete experience. Live tracking, easy payments, and exclusive rewards.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 bg-black text-white rounded-xl font-bold flex items-center space-x-2 hover:bg-gray-800 transition-all">
                <Download className="h-6 w-6" />
                <span>Download Now</span>
              </button>
              <div className="flex items-center space-x-2 px-6 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-bold">
                 <Smartphone className="h-6 w-6" />
                 <span>Scan to download</span>
              </div>
            </div>
          </div>
          <div className="flex-1 relative w-full aspect-video lg:aspect-square bg-blue-600 rounded-[3rem] overflow-hidden shadow-2xl rotate-3">
             <div className="absolute inset-0 flex items-center justify-center text-white">
                <Smartphone className="h-64 w-64 opacity-20" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                   <h4 className="text-3xl font-black mb-4">The App is Better</h4>
                   <p className="text-lg text-blue-100 font-medium">Available for Android and iOS devices. Join over 10,000+ users today.</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t dark:border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center space-x-2">
              <Bike className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-black">Kerugoya</span>
           </div>
           <div className="flex space-x-8 text-sm font-bold text-gray-500">
              <Link href="/about" className="hover:text-black dark:hover:text-white transition-colors">About</Link>
              <Link href="/services" className="hover:text-black dark:hover:text-white transition-colors">Services</Link>
              <Link href="/contact" className="hover:text-black dark:hover:text-white transition-colors">Support</Link>
           </div>
           <p className="text-sm text-gray-400">© 2026 Kerugoya Deliveries Inc.</p>
        </div>
      </footer>
    </div>
  );
}
