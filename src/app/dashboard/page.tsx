'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  name: string;
  loyaltyPoints: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      const fetchData = async () => {
        try {
          const [userRes, deliveriesRes] = await Promise.all([
            fetch('/api/user', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('/api/deliveries', { headers: { 'Authorization': `Bearer ${token}` } })
          ]);

          if (userRes.ok) setUser(await userRes.json());
          if (deliveriesRes.ok) setDeliveries(await deliveriesRes.json());
        } catch (error) {
          console.error('Failed to fetch dashboard data', error);
        }
      };
      fetchData();
    }
  }, [router]);

  const scheduledDeliveries = deliveries.filter(d => d.scheduledAt);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user.name}
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-300"
          >
            Logout
          </button>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
                    Upcoming Scheduled Rides
                  </h2>
                  {scheduledDeliveries.length > 0 ? (
                    <div className="space-y-4">
                      {scheduledDeliveries.map((d) => (
                        <div key={d.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center group hover:bg-white hover:shadow-md transition-all">
                          <div>
                            <p className="text-sm font-black text-blue-600 uppercase tracking-widest mb-1">
                              {new Date(d.scheduledAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                            <p className="font-bold text-gray-800">Trip to {JSON.parse(d.destination).address || 'Selected Destination'}</p>
                            <p className="text-xs text-gray-500 mt-1">Status: <span className="font-bold text-orange-600">{d.status}</span></p>
                          </div>
                          <Link href={`/track-order?id=${d.id}`} className="px-4 py-2 bg-black text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            View Details
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                       <p className="text-gray-400 font-bold italic">No scheduled rides found.</p>
                       <Link href="/new-delivery?scheduled=true" className="text-blue-600 font-bold text-sm mt-2 inline-block hover:underline">Plan your first trip →</Link>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-black text-gray-900 mb-4">Loyalty Points</h2>
                    <div className="flex items-end space-x-2">
                       <p className="text-5xl font-black text-blue-600">{user.loyaltyPoints}</p>
                       <p className="text-gray-400 font-bold mb-1 uppercase text-xs tracking-widest">Points earned</p>
                    </div>
                  </div>
                  <div className="bg-blue-600 p-8 rounded-3xl shadow-xl flex flex-col justify-center text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                       <Link href="/new-delivery">
                          <svg className="h-24 w-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
                       </Link>
                    </div>
                    <h2 className="text-xl font-black mb-4 relative z-10">Need a ride?</h2>
                    <Link href="/new-delivery" className="px-6 py-3 bg-white text-blue-600 font-black rounded-xl shadow-lg hover:bg-gray-100 transition duration-300 w-fit relative z-10">
                        Request Now
                    </Link>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                 <div className="bg-gray-900 p-8 rounded-[2rem] text-white shadow-2xl sticky top-24">
                    <h3 className="text-2xl font-black mb-6">Do more in the app</h3>
                    <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                       Get the best experience by using our mobile app. Live tracking, instant notifications, and faster payments.
                    </p>
                    <div className="space-y-4">
                       <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center space-x-4">
                          <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-black">
                             <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.523 15.3414c-.5511 0-.9993.4482-.9993.9993v1.9985c0 .5511.4482.9993.9993.9993h1.9985c.5511 0 .9993-.4482.9993-.9993v-1.9985c0-.5511-.4482-.9993-.9993-.9993h-1.9985zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/></svg>
                          </div>
                          <div>
                             <p className="font-bold text-sm">Download for Android</p>
                             <p className="text-[10px] text-gray-500 uppercase font-black">v4.2 stable</p>
                          </div>
                       </div>
                       <button className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition-all">
                          Get the App
                       </button>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
