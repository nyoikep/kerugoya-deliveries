'use client';

import { useEffect, useState, useMemo } from 'react';
import { useCartContext } from '@/contexts/CartContext';
import dynamic from 'next/dynamic';
import { 
  ShoppingBag, 
  MapPin, 
  Package, 
  Bike, 
  Search, 
  ChevronRight, 
  Star, 
  Plus, 
  Filter,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Award
} from 'lucide-react';
import NoSSR from '@/components/NoSSR';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  businessId: string;
}

interface Business {
  id: string;
  name: string;
  description?: string;
  category: string;
  isFeatured: boolean;
  products: Product[];
}

interface Rider {
  id: string;
  name: string;
  phone: string;
}

// Category mapping with icons
const categoryIcons: Record<string, any> = {
  'SHOP': <ShoppingBag className="w-6 h-6" />,
  'SERVICE': <Bike className="w-6 h-6" />,
  'HOTEL': <Package className="w-6 h-6" />,
  'HARDWARE': <Plus className="w-6 h-6" />,
  'Uncategorized': <ShoppingBag className="w-6 h-6" />,
};

export default function ShopPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCartContext();

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    setMounted(true);
  }, []);

  const MapPicker = useMemo(() => dynamic(() => import('@/components/MapPicker'), {
    loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse flex items-center justify-center">Loading map...</div>,
    ssr: false
  }), []);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/businesses');
        if (!response.ok) {
          throw new Error(`Failed to load businesses (${response.status})`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
           throw new Error("Invalid data format received from server");
        }
        setBusinesses(data);
      } catch (err: any) {
        console.error("Shop fetch error:", err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const handleLocationSelect = async (location: { lat: number; lng: number }) => {
    setSelectedLocation(location);
    setShowMap(false);
    try {
      const response = await fetch('/api/riders');
      if (!response.ok) throw new Error('Failed to fetch riders');
      const data = await response.json();
      setRiders(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    // Use a non-blocking toast instead of alert in a real app, but alert works for now
    // toast.success(`${product.name} added to cart!`);
  };

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(businesses.map(b => b.category || 'Uncategorized'))];
    return cats;
  }, [businesses]);

  const filteredBusinesses = useMemo(() => {
    return businesses.filter(b => {
      const matchesCategory = activeCategory === 'All' || b.category === activeCategory;
      const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           b.products.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [businesses, activeCategory, searchQuery]);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xl font-medium text-gray-600 dark:text-gray-400">Opening Kerugoya Market...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Search & Header */}
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-[64px] z-40 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search products, brands, or businesses..."
                className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all ${
                    activeCategory === cat 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Banner Section */}
        {activeCategory === 'All' && !searchQuery && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 md:p-12 text-white shadow-2xl">
              <div className="relative z-10 max-w-lg">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest mb-4">Limited Offer</span>
                <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">Fastest Delivery in Kerugoya</h2>
                <p className="text-blue-100 text-lg mb-8">Get your essentials delivered to your doorstep in under 30 minutes. Fresh, fast, and reliable.</p>
                <button 
                   onClick={() => setActiveCategory('HOTEL')}
                   className="px-8 py-4 bg-white text-blue-600 font-black rounded-2xl hover:bg-blue-50 transition-all flex items-center"
                >
                  Order Food Now <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
              <div className="absolute right-[-10%] bottom-[-10%] opacity-20 transform rotate-[-15deg]">
                 <Bike size={400} />
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl bg-orange-500 p-8 text-white shadow-xl flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest mb-4">New Service</span>
                <h3 className="text-3xl font-black mb-2">Boda Boda on Demand</h3>
                <p className="text-orange-100">Send parcels or request a ride instantly with our verified riders.</p>
              </div>
              <button 
                onClick={() => setActiveCategory('SERVICE')}
                className="mt-6 w-full py-4 bg-black/20 hover:bg-black/30 text-white font-bold rounded-2xl transition-all border border-white/30 backdrop-blur-sm"
              >
                Explore Services
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Content */}
        {filteredBusinesses.length > 0 ? (
          <div className="space-y-16">
            {filteredBusinesses.map(business => (
              <section key={business.id} className="scroll-mt-40">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-md flex items-center justify-center text-blue-600 relative">
                      {categoryIcons[business.category] || <ShoppingBag />}
                      {business.isFeatured && (
                         <div className="absolute -top-2 -right-2 bg-yellow-400 text-white p-1 rounded-full shadow-lg">
                            <Award className="w-3 h-3" />
                         </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center">
                          {business.name}
                          {business.category === 'SERVICE' && <CheckCircle2 className="ml-2 h-5 w-5 text-green-500" />}
                        </h2>
                        {business.isFeatured && (
                           <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] font-black rounded-lg border border-yellow-200 dark:border-yellow-800">
                             PROMOTED
                           </span>
                        )}
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{business.description}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setSearchQuery(business.name);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hidden md:flex items-center text-blue-600 font-bold hover:underline"
                  >
                    Visit Business <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                </div>

                {business.category === 'SERVICE' ? (
                  <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-xl border border-gray-100 dark:border-gray-800">
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div>
                           <h3 className="text-xl font-bold mb-4">Select Your Location</h3>
                           <p className="text-gray-600 dark:text-gray-400 mb-6">Tell us where you are so we can match you with the nearest rider for the fastest service.</p>
                           <button
                            className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg ${
                              showMap ? 'bg-gray-900 dark:bg-white text-white dark:text-black' : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                            onClick={() => setShowMap(!showMap)}
                          >
                            <MapPin className="h-5 w-5" /> {showMap ? 'Close Map' : 'Select Pick-up Location'}
                          </button>

                          {selectedLocation && (
                            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
                              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-2xl mb-6">
                                <p className="text-green-800 dark:text-green-300 font-bold flex items-center">
                                  <CheckCircle2 className="mr-2 h-5 w-5" /> Location set successfully
                                </p>
                              </div>
                              <h4 className="font-black text-lg mb-4 flex items-center">
                                <Bike className="mr-2 h-5 w-5 text-blue-600" /> Nearby Riders ({riders.length})
                              </h4>
                              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {riders.map(rider => (
                                  <div key={rider.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center justify-between group hover:bg-white dark:hover:bg-gray-800 transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 shadow-sm hover:shadow-md">
                                    <div>
                                      <p className="font-black text-gray-900 dark:text-white">{rider.name}</p>
                                      <p className="text-xs text-gray-500 font-bold uppercase tracking-tight">{rider.phone}</p>
                                    </div>
                                    <button className="px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                                      BOOK
                                    </button>
                                  </div>
                                ))}
                                {riders.length === 0 && (
                                  <p className="text-center py-8 text-gray-400 italic">No riders available in this area right now.</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="h-full min-h-[400px] rounded-3xl overflow-hidden shadow-inner bg-gray-100 dark:bg-gray-800 relative">
                          {!showMap && !selectedLocation && (
                             <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
                                <MapPin className="h-12 w-12 text-blue-600 mb-4 animate-bounce" />
                                <h4 className="text-xl font-black mb-2">Interactive Map</h4>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Use our map to pinpoint your exact location for precise delivery.</p>
                             </div>
                          )}
                          <NoSSR>
                            <MapPicker onLocationSelect={handleLocationSelect} userLocation={null} riderLocation={null} />
                          </NoSSR>
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {business.products.map(product => (
                      <div key={product.id} className="group bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800 flex flex-col h-full relative overflow-hidden">
                        {/* Image */}
                        <div className="aspect-square rounded-2xl mb-4 bg-gray-50 dark:bg-gray-800 flex items-center justify-center relative overflow-hidden">
                           <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 group-hover:scale-110 transition-transform duration-700"></div>
                           {product.imageUrl ? (
                             <img src={product.imageUrl} alt={product.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                           ) : (
                             <Package className="h-12 w-12 text-gray-200 dark:text-gray-700 group-hover:text-blue-500/20 transition-colors" />
                           )}
                           <div className="absolute top-2 left-2 flex flex-col gap-1">
                              <span className="px-2 py-1 bg-blue-600 text-white text-[10px] font-black rounded-lg shadow-sm">NEW</span>
                           </div>
                        </div>
                        
                        <div className="flex-grow flex flex-col">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-1 mb-2">
                             <div className="flex text-orange-400">
                                <Star size={12} fill="currentColor" />
                                <Star size={12} fill="currentColor" />
                                <Star size={12} fill="currentColor" />
                                <Star size={12} fill="currentColor" />
                                <Star size={12} fill="currentColor" className="opacity-30" />
                             </div>
                             <span className="text-[10px] text-gray-400 font-bold">(4.0)</span>
                          </div>
                          <div className="mt-auto">
                            <p className="text-lg font-black text-gray-900 dark:text-white">
                              Ksh {product.price.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-gray-500 line-through">Ksh {(product.price * 1.2).toLocaleString()}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddToCart(product)}
                          className="mt-4 w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-blue-600 hover:text-white text-gray-900 dark:text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 group/btn"
                        >
                          <ShoppingCart className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                          <span className="text-xs">ADD TO CART</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white dark:bg-gray-900 rounded-[3rem] shadow-inner border border-dashed border-gray-200 dark:border-gray-800">
             <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Search size={40} className="text-gray-300" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No results found</h3>
                <p className="text-gray-500 mb-8">We couldn\'t find any products or businesses matching your search. Try adjusting your filters or keywords.</p>
                <button 
                  onClick={() => {setSearchQuery(''); setActiveCategory('All');}}
                  className="px-8 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg"
                >
                  Reset All Filters
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Floating Cart Button (Mobile Only) */}
      <div className="md:hidden fixed bottom-8 right-6 z-50">
         <button className="w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95">
            <ShoppingCart size={28} />
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black rounded-full h-6 w-6 flex items-center justify-center border-4 border-gray-50 dark:border-gray-950">
               !
            </div>
         </button>
      </div>
    </div>
  );
}
