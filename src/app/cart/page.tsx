// src/app/cart/page.tsx
'use client';

import { useCartContext } from '@/contexts/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ShoppingCart, Trash2, Minus, Plus, CreditCard, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getTotalItems, getTotalPrice, clearCart } = useCartContext();
  const [step, setStep] = useState<'cart' | 'payment'>('cart');
  const [paymentDone, setPaymentDone] = useState(false);
  const router = useRouter();

  const handlePayment = () => {
    // Simulate M-Pesa or other payment
    setPaymentDone(true);
    alert('Payment for shop items successful! Now you can request a rider for delivery.');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8 flex items-center justify-center">
          <ShoppingCart className="h-9 w-9 mr-3 text-blue-500" /> {step === 'cart' ? 'Your Shopping Cart' : 'Pay for Your Items'}
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">Your cart is empty. Start adding some awesome items!</p>
            <Link href="/shop" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300">
              Go to Shop
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            {step === 'cart' ? (
              <>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {cartItems.map((item) => (
                    <li key={item.id} className="p-6 flex flex-col sm:flex-row items-center justify-between">
                      <div className="flex-grow text-center sm:text-left mb-4 sm:mb-0">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{item.name}</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>
                        <p className="text-blue-600 dark:text-blue-400 font-bold text-lg mt-1">
                          Ksh{item.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-l-md transition duration-200"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                            className="w-12 text-center bg-transparent focus:outline-none text-gray-900 dark:text-gray-100"
                          />
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-r-md transition duration-200"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 bg-red-600 text-white rounded-md shadow-md hover:bg-red-700 transition duration-300"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center text-lg font-bold">
                  <h3 className="text-gray-900 dark:text-gray-100 mb-2 sm:mb-0">Total Items: <span className="text-blue-600 dark:text-blue-400">{getTotalItems()}</span></h3>
                  <h3 className="text-gray-900 dark:text-gray-100">Total Price: <span className="text-blue-600 dark:text-blue-400">Ksh{getTotalPrice().toFixed(2)}</span></h3>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={clearCart}
                    className="px-8 py-3 bg-gray-600 text-white font-bold rounded-lg shadow-md hover:bg-gray-700 transition duration-300"
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={() => setStep('payment')}
                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                  >
                    Next: Payment <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="p-8">
                <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-4 flex items-center">
                    <CreditCard className="h-6 w-6 mr-2" /> Shop Payment
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 mb-3">
                    Please pay <strong>Ksh{getTotalPrice().toFixed(2)}</strong> for your items to the number below:
                  </p>
                  <p className="text-3xl font-mono font-extrabold text-center bg-blue-100 dark:bg-blue-800 p-4 rounded-lg my-4 tracking-wider">
                    +254722358904
                  </p>
                  {!paymentDone ? (
                    <button
                      onClick={handlePayment}
                      className="w-full px-6 py-4 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition duration-300 flex items-center justify-center"
                    >
                      Confirm Item Payment
                    </button>
                  ) : (
                    <div className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 p-4 rounded-lg text-center font-bold">
                      Payment Successful! Proceed to Delivery.
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep('cart')}
                    className="px-8 py-3 bg-gray-600 text-white font-bold rounded-lg shadow-md hover:bg-gray-700 transition duration-300"
                  >
                    Back to Cart
                  </button>
                  <button
                    onClick={() => router.push('/new-delivery')}
                    disabled={!paymentDone}
                    className={`px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition duration-300 ${!paymentDone ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Proceed to Delivery
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
