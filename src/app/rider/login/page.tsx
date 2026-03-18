// src/app/rider/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';

export default function RiderLoginPage() {
  const [loginType, setLoginType] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const body = loginType === 'email' ? { email, password } : { phone, password };

    const res = await fetch('/api/auth/rider/login', { // Call new rider login API
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.token);
      
      const decodedToken = jwtDecode(data.token) as { role: string };
      localStorage.setItem('user', JSON.stringify(data.user));

      if (decodedToken.role === 'RIDER') {
        router.push('/rider/dashboard');
      } else {
        // Should not happen if API correctly filters by role
        setError('Login failed. Please use the client login portal.');
        localStorage.removeItem('token'); // Clear invalid token
      }
    } else {
      const data = await res.json();
      setError(data.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Rider Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="flex justify-center mb-4">
              <label className="mr-4">
                <input
                  type="radio"
                  value="email"
                  checked={loginType === 'email'}
                  onChange={() => setLoginType('email')}
                  className="mr-1"
                />
                Email
              </label>
              <label>
                <input
                  type="radio"
                  value="phone"
                  checked={loginType === 'phone'}
                  onChange={() => setLoginType('phone')}
                  className="mr-1"
                />
                Phone
              </label>
            </div>
            {loginType === 'email' ? (
              <div>
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-gray-700">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Rider Login
          </button>
        </form>
        <div className="text-center mt-4">
          <Link href="/login" className="text-blue-500 hover:underline">
            Login as Client
          </Link>
          <span className="mx-2 text-gray-400">|</span>
          <Link href="/forgot-password" className="text-blue-500 hover:underline">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
}
