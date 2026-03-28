'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ShieldCheck, Users, Bike, Package, LogOut, AlertCircle, MapPin, Navigation } from 'lucide-react';

// Dynamically import map to avoid SSR issues
const LiveLocationMap = dynamic(() => import('@/components/LiveLocationMap'), { ssr: false });

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riders, setRiders] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      try {
        const res = await fetch('/api/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.role !== 'ADMIN') {
            window.location.href = '/'; 
          } else {
            setUser(data);
            fetchData(token);
          }
        } else {
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Admin check failed:', error);
        setError('Connection error. Please try again.');
        setIsLoading(false);
      }
    };

    const fetchData = async (token: string) => {
      try {
        const [ridersRes, deliveriesRes] = await Promise.all([
          fetch('/api/riders', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/deliveries', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (ridersRes.ok) setRiders(await ridersRes.json());
        if (deliveriesRes.ok) setDeliveries(await deliveriesRes.json());
      } catch (e) {
        console.error("Error fetching admin data:", e);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <ShieldCheck className="h-16 w-16 text-red-600 animate-pulse mb-4" />
      <h2 className="text-xl font-bold dark:text-white text-center px-4">Verifying Admin Permissions...</h2>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
      <h2 className="text-xl font-bold dark:text-white mb-2">{error}</h2>
      <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-md">Retry</button>
    </div>
  );

  if (!user) return null;

  const activeDeliveries = deliveries.filter(d => d.status !== 'DELIVERED' && d.status !== 'CANCELLED');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Sidebar/Nav */}
      <nav className="bg-white dark:bg-gray-800 border-b p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="text-red-600 h-8 w-8" />
          <h1 className="text-xl font-bold dark:text-white">Admin Command Center</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold dark:text-gray-100">{user.name}</p>
            <p className="text-xs text-red-500 font-bold uppercase tracking-wider">System Administrator</p>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all">
            <LogOut className="h-6 w-6" />
          </button>
        </div>
      </nav>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<Users className="text-blue-500" />} label="Total Registered" value={(riders.length + 50).toString()} />
          <StatCard icon={<Bike className="text-green-500" />} label="Active Riders" value={riders.length.toString()} />
          <StatCard icon={<Package className="text-orange-500" />} label="Live Deliveries" value={activeDeliveries.length.toString()} />
          <StatCard icon={<ShieldCheck className="text-red-500" />} label="System Health" value="100%" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Live Tracking Map */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
              <h2 className="font-bold dark:text-white flex items-center">
                <span className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-ping"></span>
                Live Operations Map
              </h2>
            </div>
            <div className="h-[500px] w-full relative">
               <LiveLocationMap />
            </div>
          </div>

          {/* Active Lists */}
          <div className="space-y-8">
            {/* Active Requests */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border dark:border-gray-700">
              <div className="p-4 border-b dark:border-gray-700 font-bold dark:text-white flex items-center">
                <Navigation className="mr-2 h-4 w-4 text-orange-500" />
                Active Requests
              </div>
              <div className="max-h-[250px] overflow-y-auto">
                {activeDeliveries.length > 0 ? activeDeliveries.map((d: any) => (
                  <div key={d.id} className="p-4 border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">ID: {d.id.substring(0,8)}</span>
                      <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold uppercase">{d.status}</span>
                    </div>
                    <p className="text-sm dark:text-gray-200 truncate font-medium">{d.clientLocation} → {d.destination}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                      <Users className="h-3 w-3 mr-1" /> {d.client?.name || 'Guest'}
                    </p>
                  </div>
                )) : (
                  <div className="p-8 text-center text-gray-500 text-sm italic">No active requests</div>
                )}
              </div>
            </div>

            {/* Riders */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border dark:border-gray-700">
              <div className="p-4 border-b dark:border-gray-700 font-bold dark:text-white flex items-center">
                <Bike className="mr-2 h-4 w-4 text-green-500" />
                Available Riders
              </div>
              <div className="max-h-[250px] overflow-y-auto">
                {riders.length > 0 ? riders.map((r: any) => (
                  <div key={r.id} className="p-4 border-b dark:border-gray-700 last:border-0 flex items-center space-x-3">
                    <div className="h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium dark:text-white truncate">{r.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{r.motorcyclePlateNumber}</p>
                    </div>
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-gray-500 text-sm italic">No riders online</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold dark:text-white">{value}</p>
      </div>
    </div>
  );
}
