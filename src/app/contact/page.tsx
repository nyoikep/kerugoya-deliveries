// src/app/contact/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-12 flex items-center justify-center">
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-600 dark:text-blue-400 mb-4">
            Get in Touch
          </h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            We're here to help! Reach out to us for any inquiries, feedback, or support.
          </p>
        </header>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl grid md:grid-cols-2 gap-10">
          {/* Contact Information Section */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
              Our Details
            </h2>
            <div className="space-y-6">
              <div className="flex items-center text-lg text-gray-700 dark:text-gray-300">
                <Mail className="h-6 w-6 mr-3 text-blue-500 flex-shrink-0" />
                <span>Email: <a href="mailto:support@kerugoyaconnect.com" className="text-blue-600 hover:underline dark:text-blue-400">support@kerugoyaconnect.com</a></span>
              </div>
              <div className="flex items-center text-lg text-gray-700 dark:text-gray-300">
                <Phone className="h-6 w-6 mr-3 text-blue-500 flex-shrink-0" />
                <span>Phone: <a href="tel:+254722358904" className="text-blue-600 hover:underline dark:text-blue-400">+254722358904</a></span>
              </div>
              <div className="flex items-center text-lg text-gray-700 dark:text-gray-300">
                <MapPin className="h-6 w-6 mr-3 text-blue-500 flex-shrink-0" />
                <span>Address: 123 Mobility Drive, Kerugoya, Kenya</span>
              </div>
            </div>
          </div>

          {/* Simple Contact Form / Message Section */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
              Send Us a Message
            </h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input type="text" id="name" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input type="email" id="email" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                <textarea id="message" rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
              <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
                Send Message
              </button>
            </form>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Link href="/" className="px-6 py-3 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg shadow-md hover:bg-gray-400 dark:hover:bg-gray-600 transition duration-300">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
