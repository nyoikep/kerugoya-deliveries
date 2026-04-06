'use client';

import { useCartContext } from '@/contexts/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  Minus, 
  Plus, 
  CreditCard, 
  ArrowRight, 
  ChevronRight,
  ShieldCheck,
  Truck,
  Package,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getTotalItems, getTotalPrice, clearCart } = useCartContext();
  const [step, setStep] = useState<'cart' | 'payment'>('cart');
  const [paymentDone, setPaymentDone] = useState(false);
  const router = useRouter();

  const handlePayment = () => {
    // Simulate M-Pesa or other payment
    setPaymentDone(true);
    // In a real app, this would involve a server-side payment verification
  };

  const subtotal = useMemo(() => getTotalPrice(), [cartItems]);
  const deliveryEstimate = 150; // Base estimate for Kerugoya
  const total = subtotal + (paymentDone ? 0 : 0); // Payment is only for items now

  if (cartItems.length === 0 && !paymentDone) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mb-6">
          <ShoppingCart size={40} className="text-gray-300" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-sm">Looks like you haven\'t added anything to your cart yet. Explore our shops and find something great!</p>
        <Link href="/shop" className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-12">
           <div className="flex items-center w-full max-w-2xl">
              <div className="flex flex-col items-center flex-1">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${step === 'cart' ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/30' : 'bg-green-500 text-white'}`}>
                    {step === 'cart' ? '1' : <CheckCircle2 size={20} />}
                 </div>
                 <span className={`text-xs mt-2 font-bold uppercase tracking-widest ${step === 'cart' ? 'text-blue-600' : 'text-green-500'}`}>Review Cart</span>
              </div>
              <div className={`h-1 flex-1 mx-2 rounded-full ${step === 'payment' ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-800'}`}></div>
              <div className="flex flex-col items-center flex-1">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${step === 'payment' ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/30' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>
                    2
                 </div>
                 <span className={`text-xs mt-2 font-bold uppercase tracking-widest ${step === 'payment' ? 'text-blue-600' : 'text-gray-400'}`}>Payment</span>
              </div>
              <div className="h-1 flex-1 mx-2 rounded-full bg-gray-200 dark:bg-gray-800"></div>
              <div className="flex flex-col items-center flex-1">
                 <div className="w-10 h-10 rounded-full flex items-center justify-center font-black bg-gray-200 dark:bg-gray-800 text-gray-500">
                    3
                 </div>
                 <span className="text-xs mt-2 font-bold uppercase tracking-widest text-gray-400">Delivery</span>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {step === 'cart' ? (
              <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-8 border-b dark:border-gray-800 flex justify-between items-center">
                   <h2 className="text-2xl font-black flex items-center">
                     <ShoppingCart className="mr-3 text-blue-600" /> Shopping Cart ({cartItems.length})
                   </h2>
                   <button 
                     onClick={clearCart}
                     className="text-sm font-bold text-red-500 hover:text-red-600 flex items-center"
                   >
                     <Trash2 size={16} className="mr-1" /> Clear All
                   </button>
                </div>
                <ul className="divide-y divide-gray-50 dark:divide-gray-800">
                  {cartItems.map((item) => (
                    <li key={item.id} className="p-8 flex flex-col sm:flex-row items-center gap-6 group">
                      <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Package size={32} className="text-gray-300" />
                      </div>
                      <div className="flex-grow text-center sm:text-left">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white line-clamp-1">{item.name}</h3>
                        <p className="text-gray-500 text-sm font-medium mb-2">{item.description || 'Quality product from local shop'}</p>
                        <p className="text-xl font-black text-blue-600 dark:text-blue-400">
                          Ksh {item.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-xl p-1 border dark:border-gray-700">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all"
                          >
                            <Minus size={18} />
                          </button>
                          <span className="w-12 text-center font-black text-lg">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="p-8 bg-gray-50/50 dark:bg-gray-800/30">
                   <Link href="/shop" className="text-blue-600 font-bold flex items-center hover:underline">
                      <ArrowLeft size={18} className="mr-2" /> Continue Shopping
                   </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                   <h2 className="text-2xl font-black mb-8 flex items-center">
                     <CreditCard className="mr-3 text-blue-600" /> Payment Details
                   </h2>
                   
                   {!paymentDone ? (
                      <div className="space-y-8">
                         <div className="p-8 bg-blue-600 text-white rounded-[2rem] shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                               <CreditCard size={120} />
                            </div>
                            <div className="relative z-10">
                               <p className="text-blue-100 text-xs font-black uppercase tracking-widest mb-4">M-Pesa Payment</p>
                               <p className="text-lg font-medium mb-1">Pay to Business Number</p>
                               <h3 className="text-4xl font-black tracking-widest mb-8">+254 722 358 904</h3>
                               <div className="flex justify-between items-end">
                                  <div>
                                     <p className="text-blue-100 text-xs font-black uppercase tracking-widest">Amount to Pay</p>
                                     <p className="text-3xl font-black text-white">Ksh {subtotal.toLocaleString()}</p>
                                  </div>
                                  <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30 text-xs font-bold">
                                     SECURE PAYMENT
                                  </div>
                               </div>
                            </div>
                         </div>

                         <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-2xl border border-orange-100 dark:border-orange-800/50">
                            <p className="text-orange-800 dark:text-orange-300 text-sm font-bold flex items-start">
                               <ShieldCheck size={20} className="mr-3 flex-shrink-0 mt-0.5" />
                               Instructions: Use the M-Pesa Send Money option to the number above. Once you receive the confirmation message, click the button below.
                            </p>
                         </div>

                         <button
                           onClick={handlePayment}
                           className="w-full py-5 bg-green-600 text-white font-black text-xl rounded-[1.5rem] shadow-xl hover:bg-green-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                         >
                           I Have Paid Ksh {subtotal.toLocaleString()} <CheckCircle2 />
                         </button>
                      </div>
                   ) : (
                      <div className="text-center py-12 space-y-6">
                         <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <CheckCircle2 size={48} />
                         </div>
                         <h3 className="text-3xl font-black text-gray-900 dark:text-white">Payment Confirmed!</h3>
                         <p className="text-gray-500 max-w-sm mx-auto">Great! Your items are now paid for. Let\'s get a rider to deliver them to you.</p>
                         <button
                           onClick={() => router.push('/new-delivery')}
                           className="w-full py-5 bg-blue-600 text-white font-black text-xl rounded-2xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                         >
                           Book Delivery Now <Truck />
                         </button>
                      </div>
                   )}
                </div>
                
                {!paymentDone && (
                  <button 
                    onClick={() => setStep('cart')}
                    className="flex items-center text-gray-500 font-bold hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <ArrowLeft size={18} className="mr-2" /> Back to Review Cart
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
             <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24">
                <h3 className="text-xl font-black mb-8">Order Summary</h3>
                
                <div className="space-y-4 mb-8">
                   <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
                      <span>Subtotal ({getTotalItems()} items)</span>
                      <span className="font-bold text-gray-900 dark:text-white">Ksh {subtotal.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
                      <span>Service Fee</span>
                      <span className="font-bold text-gray-900 dark:text-white">FREE</span>
                   </div>
                   <div className="pt-4 border-t dark:border-gray-800 flex justify-between items-end">
                      <div>
                         <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Amount</p>
                         <p className="text-3xl font-black text-gray-900 dark:text-white">Ksh {total.toLocaleString()}</p>
                      </div>
                   </div>
                </div>

                {step === 'cart' && (
                  <button
                    onClick={() => setStep('payment')}
                    className="w-full py-5 bg-blue-600 text-white font-black text-lg rounded-2xl shadow-lg hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                  >
                    Proceed to Payment <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                )}

                <div className="mt-8 space-y-4">
                   <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-tighter">
                      <ShieldCheck size={16} className="text-green-500" />
                      Secure Checkout Guarantee
                   </div>
                   <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-tighter">
                      <Truck size={16} className="text-blue-500" />
                      Verified Fast Riders
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
