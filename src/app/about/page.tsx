// src/app/about/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Truck, Users, ShieldCheck, MapPin, ShoppingBag } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-600 dark:text-blue-400 mb-4">
            About Kerugoya Connect
          </h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Your trusted partner for seamless urban mobility and efficient deliveries in Kerugoya.
          </p>
        </header>

        <section className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
            <MapPin className="h-7 w-7 mr-3 text-blue-500" /> Our Mission
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            At Kerugoya Connect, we are dedicated to revolutionizing how people move and goods are delivered within Kerugoya. Our mission is to provide an innovative, reliable, and accessible platform that seamlessly connects riders with transportation and consumers with local businesses.
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            We aim to foster a vibrant community, empower local economies, and enhance the quality of urban life through cutting-edge technology and exceptional service.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
              <Truck className="h-7 w-7 mr-3 text-green-500" /> What We Offer
            </h2>
            <ul className="space-y-4 text-lg text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <ShieldCheck className="h-6 w-6 mr-3 text-green-500 flex-shrink-0 mt-1" />
                <span>**Reliable Ride-Hailing:** Get to your destination quickly and safely with our network of trusted drivers.</span>
              </li>
              <li className="flex items-start">
                <ShoppingBag className="h-6 w-6 mr-3 text-blue-500 flex-shrink-0 mt-1" />
                <span>**Effortless Deliveries:** Order food, groceries, and other essentials from your favorite local businesses.</span>
              </li>
              <li className="flex items-start">
                <MapPin className="h-6 w-6 mr-3 text-red-500 flex-shrink-0 mt-1" />
                <span>**Real-time Tracking:** Monitor your ride or delivery on an interactive map, from pickup to drop-off.</span>
              </li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
              <Users className="h-7 w-7 mr-3 text-purple-500" /> Our Values
            </h2>
            <ul className="space-y-4 text-lg text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">Innovation:</span>
                <span>Continuously seeking new ways to improve urban mobility and logistics.</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">Reliability:</span>
                <span>Ensuring consistent and dependable service for every user.</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">Community:</span>
                <span>Building strong connections between riders, businesses, and customers.</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">Safety:</span>
                <span>Prioritizing the well-being of everyone who uses our platform.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="text-center bg-blue-600 dark:bg-blue-800 text-white p-8 rounded-lg shadow-xl">
          <h2 className="text-3xl font-bold mb-4">Join Our Journey</h2>
          <p className="text-lg mb-6">
            Be a part of the future of transportation and delivery in Kerugoya. Whether you're a rider, a customer, or a local business, Kerugoya Connect is here to serve you.
          </p>
          <Link href="/register" className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg shadow-lg hover:bg-gray-200 transition duration-300">
            Get Started Today
          </Link>
        </section>
      </div>
    </div>
  );
}
