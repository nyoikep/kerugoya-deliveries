'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import Image from 'next/image';
import NoSSR from '@/components/NoSSR';

export default function LoginPage() {
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

    const res = await fetch('/api/auth/login', {
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
        router.push('/dashboard');
      }
    } else {
      const data = await res.json();
      if (data.message === 'Riders must log in through the rider portal.') {
        setError('Riders must log in through the rider portal.');
      } else {
        setError(data.message);
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <NoSSR>
        <Image
          src="/pexels-clayton-943956-11206901.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black opacity-60"></div>
      </NoSSR>
      
      <div className="relative z-10 max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">Login to Kerugoya</h2>
        {error && <p className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 p-3 rounded-md text-center mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <div className="flex justify-center mb-6 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
              <button
                type="button"
                className={`flex-1 py-2 text-center text-sm font-medium rounded-md transition-colors duration-200 ${
                  loginType === 'email' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                onClick={() => setLoginType('email')}
              >
                Email
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-center text-sm font-medium rounded-md transition-colors duration-200 ${
                  loginType === 'phone' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                onClick={() => setLoginType('phone')}
              >
                Phone
              </button>
            </div>

            {loginType === 'email' ? (
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="name@example.com"
                  required
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="+2547XXXXXXXX"
                  required
                />
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Login
          </button>
          
          <div className="text-center mt-6">
            <Link href="/forgot-password" className="text-blue-600 hover:underline dark:text-blue-400 text-sm">
              Forgot Password?
            </Link>
          </div>
          <div className="text-center mt-2">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-600 hover:underline dark:text-blue-400">
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
