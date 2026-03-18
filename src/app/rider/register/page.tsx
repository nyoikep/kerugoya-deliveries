// src/app/rider/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import NoSSR from '@/components/NoSSR';
import { CreditCard, ArrowRight } from 'lucide-react'; // Assuming lucide-react is installed

export default function RiderRegisterPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [motorcyclePlateNumber, setMotorcyclePlateNumber] = useState(''); // New state for Motorcycle Plate Number
  const [error, setError] = useState('');
  const [paymentMade, setPaymentMade] = useState(false);
  const router = useRouter();

  const handlePayment = () => {
    // In a real application, you would integrate a payment gateway here.
    // For now, we'll just simulate a successful payment.
    setPaymentMade(true);
    alert('Payment successful!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!paymentMade) {
      setError('Please pay the registration fee before registering.');
      return;
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, phone, password, name, idNumber, motorcyclePlateNumber, role: 'RIDER' }), // Include motorcyclePlateNumber
    });

    if (res.ok) {
      alert('Rider registration successful! Please log in.');
      router.push('/login');
    } else {
      const data = await res.json();
      setError(data.message || 'Registration failed');
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
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">Rider Registration</h2>
        {error && <p className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 p-3 rounded-md text-center mb-4">{error}</p>}
        
        {!paymentMade ? (
          <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg shadow-inner mb-6">
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-4 flex items-center justify-center">
              <CreditCard className="h-6 w-6 mr-2" /> Registration Fee
            </h3>
            <p className="text-blue-700 dark:text-blue-300 mb-3">
              A one-time registration fee of{' '}
              <strong className="text-blue-900 dark:text-blue-100">Ksh. 200</strong> is required.
              Please send the amount to the number:
            </p>
            <p className="text-3xl font-mono font-extrabold text-center bg-blue-100 dark:bg-blue-800 p-4 rounded-lg my-4 tracking-wider">
              +254722358904
            </p>
            <button
              onClick={handlePayment}
              className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition duration-300 flex items-center justify-center"
            >
              <ArrowRight className="h-5 w-5 mr-2" /> Confirm Payment
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="name">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                placeholder="John Doe"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
                Email Address
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
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="idNumber">
                National ID Number
              </label>
              <input
                type="text"
                id="idNumber"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                placeholder="e.g., 12345678"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="motorcyclePlateNumber">
                Motorcycle Plate Number
              </label>
              <input
                type="text"
                id="motorcyclePlateNumber"
                value={motorcyclePlateNumber}
                onChange={(e) => setMotorcyclePlateNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                placeholder="e.g., KBC 123A"
                required
              />
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
              Register as Rider
            </button>
          </form>        
        )}
        
        <div className="text-center mt-6">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
              Login
            </Link>
          </p>
        </div>
        <div className="text-center mt-2">
          <Link href="/register" className="text-blue-600 hover:underline dark:text-blue-400 text-sm">
            Register as Client
          </Link>
        </div>
      </div>
    </div>
  );
}
