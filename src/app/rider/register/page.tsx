'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import NoSSR from '@/components/NoSSR';
import { Upload } from 'lucide-react';

export default function RiderRegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [motorcyclePlateNumber, setMotorcyclePlateNumber] = useState('');
  const [password, setPassword] = useState('');
  const [idCardFile, setIdCardFile] = useState<string | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdCardFile(e.target.files[0].name); // Simulated upload
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!idCardFile) {
      setError('Please upload your ID or Passport card.');
      return;
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name, 
        email, 
        phone, 
        password, 
        idNumber, 
        motorcyclePlateNumber, 
        idCardUrl: idCardFile, // In real app, upload to S3/Cloudinary first
        role: 'RIDER' 
      }),
    });

    if (res.ok) {
      router.push('/login');
    } else {
      const data = await res.json();
      setError(data.message);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12">
      <NoSSR>
        <Image
          src="/pexels-mcgzay-30661393.jpg"
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
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" required />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">ID Number</label>
              <input type="text" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" required />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Plate Number</label>
              <input type="text" value={motorcyclePlateNumber} onChange={(e) => setMotorcyclePlateNumber(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" required />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Upload ID / Passport Card</label>
            <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
              <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
              <div className="flex flex-col items-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">{idCardFile || 'Click or drag image to upload'}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" required />
          </div>

          <button type="submit" className="w-full bg-black text-white font-bold py-3 rounded-lg shadow-lg hover:bg-gray-800 transition duration-300">
            Register as Rider
          </button>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Already have a rider account?{' '}
            <Link href="/rider/login" className="text-blue-600 hover:underline dark:text-blue-400">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
