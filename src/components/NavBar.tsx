// src/components/NavBar.tsx
'use client';

import { useState, useEffect } from 'react'; // Import useState and useEffect
import Link from 'next/link';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useCartContext } from '@/contexts/CartContext';
import { Menu, X, ShoppingCart, Bike } from 'lucide-react'; // Import Menu, X and Bike icons

export default function NavBar() {
  const { cartItems } = useCartContext();
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // State for mobile menu
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch('/api/user', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setUserRole(data.role);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
    };

    fetchUserRole();
  }, []);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg p-4 relative z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 transition duration-300">
          Kerugoya Connect
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition duration-300 font-medium">
            Home
          </Link>
          <Link href="/track-order" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition duration-300 font-medium">
            Track Order
          </Link>
          <Link href="/shop" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition duration-300 font-medium">
            Shop
          </Link>
          
          {userRole === 'RIDER' && (
            <Link href="/rider/dashboard" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition duration-300 font-bold flex items-center">
              <Bike className="h-5 w-5 mr-1" /> Rider Portal
            </Link>
          )}

          <Link href="/cart" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition duration-300 font-medium relative flex items-center">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          <ThemeSwitcher />
          <Link href="/login" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300">
            Login
          </Link>
        </div>

        {/* Mobile Hamburger/Close Button */}
        <div className="md:hidden flex items-center space-x-2">
          <Link href="/cart" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition duration-300 font-medium relative flex items-center">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          <ThemeSwitcher />
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700 dark:text-gray-300 focus:outline-none">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 absolute top-full left-0 w-full py-4 shadow-lg">
          <div className="flex flex-col items-center space-y-4">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition duration-300 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link href="/track-order" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition duration-300 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Track Order
            </Link>
            <Link href="/shop" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition duration-300 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Shop
            </Link>

            {userRole === 'RIDER' && (
              <Link href="/rider/dashboard" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition duration-300 font-bold flex items-center" onClick={() => setMobileMenuOpen(false)}>
                <Bike className="h-5 w-5 mr-1" /> Rider Portal
              </Link>
            )}

            <Link href="/login" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300" onClick={() => setMobileMenuOpen(false)}>
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

