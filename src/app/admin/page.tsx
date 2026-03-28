'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ShieldCheck, Users, Bike, Package, LogOut } from 'lucide-react';

// Dynamically import map to avoid SSR issues
const LiveLocationMap = dynamic(() => import('@/components/LiveLocationMap'), { ssr: false });

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('/api/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.role !== 'ADMIN') {
            router.push('/'); // Redirect non-admins
          } else {
            setUser(data);
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar/Nav */}
      <nav className="bg-white dark:bg-gray-800 border-b p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="text-red-600 h-8 w-8" />
          <h1 className="text-xl font-bold dark:text-white">Admin Command Center</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium dark:text-gray-300">Welcome, {user.name}</span>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition-colors">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </nav>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<Users className="text-blue-500" />} label="Total Users" value="152" />
          <StatCard icon={<Bike className="text-green-500" />} label="Active Riders" value="12" />
          <StatCard icon={<Package className="text-orange-500" />} label="Live Deliveries" value="8" />
          <StatCard icon={<ShieldCheck className="text-red-500" />} label="System Health" value="100%" />
        </div>

        {/* Live Tracking Map */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
            <h2 className="font-bold dark:text-white">Live Operations Map</h2>
            <span className="flex items-center text-xs text-green-500 font-bold animate-pulse">
              <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span> LIVE UPDATES
            </span>
          </div>
          <div className="h-[600px] w-full relative">
             <LiveLocationMap />
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
