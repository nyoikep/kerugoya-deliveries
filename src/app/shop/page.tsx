'use client';

import { useEffect, useState, useMemo } from 'react';
import { useCartContext } from '@/contexts/CartContext';
import dynamic from 'next/dynamic';
import { ShoppingBag, MapPin, Package, Bike } from 'lucide-react'; // Assuming lucide-react is installed

import NoSSR from '@/components/NoSSR';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  businessId: string;
}

interface Business {
  id:string;
  name: string;
  description?: string;
  category: string;
  products: Product[];
}

interface Rider {
  id: string;
  name: string;
  phone: string;
}

export default function ShopPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCartContext();

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [showMap, setShowMap] = useState(false);

  // Dynamically import MapPicker to avoid SSR issues with Leaflet
  const MapPicker = useMemo(() => dynamic(() => import('@/components/MapPicker'), {
    loading: () => <p className="text-center py-4">Loading map...</p>,
    ssr: false
  }), []);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await fetch('/api/businesses');
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setBusinesses(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const handleLocationSelect = async (location: { lat: number; lng: number }) => {
    setSelectedLocation(location);
    setShowMap(false); // Hide map after selection
    try {
      const response = await fetch('/api/riders');
      if (!response.ok) {
        throw new Error('Failed to fetch riders');
      }
      const data = await response.json();
      setRiders(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    alert(`${product.name} has been added to your cart.`);
  };

  const businessesByCategory = useMemo(() => {
    return businesses.reduce((acc, business) => {
      const category = business.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(business);
      return acc;
    }, {} as Record<string, Business[]>);
  }, [businesses]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-gray-700 dark:text-gray-300">Loading businesses...</p>
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

  const serviceBusinesses = businessesByCategory['SERVICE'] || [];
  const shopBusinesses = Object.fromEntries(
    Object.entries(businessesByCategory).filter(([category]) => category !== 'SERVICE')
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Services Section */}
        {serviceBusinesses.length > 0 && (
          <div className="mb-16 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8 flex items-center">
              <Package className="h-9 w-9 mr-3 text-green-500" /> Our Services
            </h1>
            {serviceBusinesses.map((business) => (
              <div key={business.id} className="mb-10 p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">{business.name}</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">{business.description}</p>
                
                <button
                  className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                  onClick={() => setShowMap(!showMap)}
                >
                  <MapPin className="h-5 w-5 mr-2" /> {showMap ? 'Hide Map' : 'Select Service Location'}
                </button>
                
                {showMap && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Choose your service location on the map:</h3>
                    <div className="h-80 w-full rounded-lg overflow-hidden shadow-md">
                      <NoSSR>
                        <MapPicker onLocationSelect={handleLocationSelect} userLocation={null} riderLocation={null} />
                      </NoSSR>
                    </div>
                  </div>
                )}
                
                {selectedLocation && (
                  <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-inner">
                    <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-5 flex items-center">
                      <Bike className="h-7 w-7 mr-2" /> Available Riders Near You
                    </h3>
                    {riders.length > 0 ? (
                      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {riders.map(rider => (
                          <li key={rider.id} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow">
                            <p className="font-bold text-gray-900 dark:text-gray-100 mb-1">{rider.name}</p>
                            <p className="text-gray-700 dark:text-gray-300">{rider.phone}</p>
                            <button className="mt-4 w-full px-5 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition duration-300">
                              Book Now
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-lg text-blue-700 dark:text-blue-300 text-center">No riders available at the moment. Please try again later.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Shop Our Products Section */}
        {Object.keys(shopBusinesses).length > 0 && (
          <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8 flex items-center">
              <ShoppingBag className="h-9 w-9 mr-3 text-blue-500" /> Shop Our Products
            </h1>
            {Object.entries(shopBusinesses).map(([category, businesses]) => (
              <div key={category} className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 border-b-2 border-gray-200 dark:border-gray-700 pb-3">{category}</h2>
                {businesses.map((business) => (
                  <div key={business.id} className="mb-10 p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{business.name}</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">{business.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {business.products.map((product) => (
                        <div key={product.id} className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-5 flex flex-col justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{product.name}</h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{product.description}</p>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">Ksh{product.price.toFixed(2)}</p>
                            <button
                              className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition duration-300"
                              onClick={() => handleAddToCart(product)}
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
