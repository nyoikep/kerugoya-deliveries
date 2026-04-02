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
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', password: '', role: 'CLIENT' });
  const [isAddingUser, setIsAddingUser] = useState(false);
  
  const router = useRouter();

  const fetchData = async (token: string) => {
    try {
      const [ridersRes, deliveriesRes, pendingRes, allUsersRes] = await Promise.all([
        fetch('/api/riders', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/deliveries', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/users/all', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (ridersRes.ok) setRiders(await ridersRes.json());
      if (deliveriesRes.ok) setDeliveries(await deliveriesRes.json());
      if (pendingRes.ok) setPendingUsers(await pendingRes.json());
      if (allUsersRes.ok) setAllUsers(await allUsersRes.json());
    } catch (e) {
      console.error("Error fetching admin data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, redirecting to login');
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
             console.log('User is not an admin, redirecting to home');
             router.push('/'); 
          } else {
            setUser(data);
            fetchData(token);
          }
        } else {
          console.log('Token verification failed, redirecting to login');
          router.push('/login');
        }
      } catch (error) {
        console.error('Admin check failed:', error);
        setError('Connection error. Please try again.');
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, status: newStatus })
      });
      if (res.ok) {
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
        if (newStatus === 'APPROVED') {
          // Re-fetch riders if it was a rider
          const ridersRes = await fetch('/api/riders', { headers: { 'Authorization': `Bearer ${token}` } });
          if (ridersRes.ok) setRiders(await ridersRes.json());
          // Refresh all users
          fetchData(token!);
        }
      }
    } catch (e) {
      console.error("Error updating user status:", e);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setIsAddingUser(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setShowAddUserModal(false);
        setNewUser({ name: '', email: '', phone: '', password: '', role: 'CLIENT' });
        fetchData(token!);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to add user');
      }
    } catch (e) {
      console.error("Error adding user:", e);
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAllUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete user');
      }
    } catch (e) {
      console.error("Error deleting user:", e);
    }
  };

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

  // Stop rendering the dashboard if not an admin
  if (!user || user.role !== 'ADMIN') return null;

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
        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'users' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            User Management
          </button>
        </div>

        {activeTab === 'overview' ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard icon={<Users className="text-blue-500" />} label="Total Users" value={allUsers.length.toString()} />
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
                {/* Activation Requests */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-red-200 dark:border-red-900/30">
                  <div className="p-4 border-b dark:border-gray-700 font-bold dark:text-white flex items-center bg-red-50 dark:bg-red-900/10">
                    <ShieldCheck className="mr-2 h-4 w-4 text-red-500" />
                    Activation Requests ({pendingUsers.length})
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {pendingUsers.length > 0 ? pendingUsers.map((u: any) => (
                      <div key={u.id} className="p-4 border-b dark:border-gray-700 last:border-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-bold dark:text-white">{u.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{u.role} | {u.phone}</p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            u.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {u.status}
                          </span>
                        </div>
                        {u.role === 'RIDER' && (
                          <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-[11px] text-gray-600 dark:text-gray-300">
                            <p>ID: {u.idNumber}</p>
                            <p>Plate: {u.motorcyclePlateNumber}</p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(u.id, 'APPROVED')}
                            className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded transition-colors"
                          >
                            Approve
                          </button>
                          {u.status === 'PENDING' && (
                            <button 
                              onClick={() => handleUpdateStatus(u.id, 'REJECTED')}
                              className="flex-1 px-3 py-1.5 bg-gray-200 hover:bg-red-600 hover:text-white text-gray-700 text-xs font-bold rounded transition-colors"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-gray-500 text-sm italic">No pending requests</div>
                    )}
                  </div>
                </div>

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
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold dark:text-white">All Registered Accounts</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage all system users, view account details, and security tokens.</p>
              </div>
              <button 
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-all flex items-center"
              >
                <Users className="mr-2 h-4 w-4" />
                Add New User
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="p-4">Name & Role</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">ID / Plate</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {allUsers.map((u: any) => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="p-4">
                        <p className="font-bold dark:text-white">{u.name}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 
                          u.role === 'RIDER' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm dark:text-gray-200">{u.email}</p>
                        <p className="text-xs text-gray-500">{u.phone}</p>
                      </td>
                      <td className="p-4">
                        {u.role === 'RIDER' ? (
                          <div className="text-xs dark:text-gray-300">
                            <p>ID: {u.idNumber || 'N/A'}</p>
                            <p>Plate: {u.motorcyclePlateNumber || 'N/A'}</p>
                          </div>
                        ) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          u.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                          u.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                          title="Delete User"
                        >
                          <AlertCircle className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
              <h3 className="text-xl font-bold dark:text-white">Add New System User</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  placeholder="e.g. Jane Smith"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                  <input 
                    type="email" 
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                    placeholder="jane@test.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                  <input 
                    type="tel" 
                    required
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                    placeholder="0712345678"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  placeholder="Min 6 characters"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Account Role</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                >
                  <option value="CLIENT">Client / Business Owner</option>
                  <option value="RIDER">Delivery Rider</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isAddingUser}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg disabled:opacity-50 transition-all"
                >
                  {isAddingUser ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
