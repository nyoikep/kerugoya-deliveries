import type { Metadata } from "next";
import Link from "next/link";
import ClientOnlyNavBar from "@/components/ClientOnlyNavBar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CartProvider } from "@/contexts/CartContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleMapsProvider } from "@/contexts/GoogleMapsContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kerugoya Deliveries",
  description: "Home and office delivery service in Kerugoya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GoogleMapsProvider>
            <SocketProvider>
              <CartProvider>
                <ClientOnlyNavBar />
                <div className="flex-grow">{children}</div>
                <footer className="mt-8 p-8 text-center bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                  <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-left mb-8">
                    <div>
                      <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">Kerugoya Deliveries</h3>
                      <p className="text-gray-600 dark:text-gray-400">Your trusted delivery partner in Kerugoya. Fast, reliable, and secure.</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">Quick Links</h3>
                      <ul className="space-y-2">
                        <li><Link href="/shop" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">Shop</Link></li>
                        <li><Link href="/track-order" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">Track Order</Link></li>
                        <li><Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">About Us</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">For Riders</h3>
                      <ul className="space-y-2">
                        <li><Link href="/rider/register" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">Become a Rider</Link></li>
                        <li><Link href="/rider/login" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">Rider Portal</Link></li>
                      </ul>
                    </div>
                  </div>
                  <div className="text-gray-500 dark:text-gray-500 text-sm">
                    (c) 2026 Peter Maina. All rights reserved.
                  </div>
                </footer>
              </CartProvider>
            </SocketProvider>
          </GoogleMapsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
