'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import {
  Menu,
  X,
  ShoppingBag,
  Search,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
      const [isSidebarOpen, setIsSidebarOpen] = useState(false);

      const [cartItems, setCartItems] = useState<CartItem[]>([]);
    
      const total = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    
      // Cart item functions
      const updateQuantity = (id: number, newQuantity: number) => {
        if (newQuantity <= 0) return;
        setCartItems((items) => {
          const updatedItems = items.map((item) =>
            item.id === id ? { ...item, quantity: newQuantity } : item
          );
          // Sync with localStorage
          localStorage.setItem('cart', JSON.stringify(updatedItems));
          // Dispatch custom event to notify other components
          window.dispatchEvent(new CustomEvent('cartUpdated'));
          return updatedItems;
        });
      };
    
      const removeItem = (id: number) => {
        setCartItems((items) => {
          const updatedItems = items.filter((item) => item.id !== id);
          // Sync with localStorage
          localStorage.setItem('cart', JSON.stringify(updatedItems));
          // Dispatch custom event to notify other components
          window.dispatchEvent(new CustomEvent('cartUpdated'));
          return updatedItems;
        });
      };

      const checkout = () => {
        setCartItems([]);
      };
    
      
      React.useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        }
        
        // Listen for storage changes
        const handleStorageChange = (e: StorageEvent) => {
          if (e.key === 'cart' && e.newValue) {
            setCartItems(JSON.parse(e.newValue));
          }
        };
    
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
          window.removeEventListener('storage', handleStorageChange);
        };
      }, []);
  return (
    <ClerkProvider>
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/20 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link
                  href="/"
                  className="text-2xl font-bold text-gray-800 hover:text-gray-600 transition-colors"
                >
                  EcomStore
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-8">
                  <Link
                    href="/"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    href="/products"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Products
                  </Link>
                  <Link
                    href="/categories"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Categories
                  </Link>
                  <Link
                    href="/about"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    About
                  </Link>
                  <Link
                    href="/contact"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Contact
                  </Link>
                </div>
              </div>
              <div className="space-x-3 flex items-center">
                <SignedOut>
                  <SignInButton />
                  <SignUpButton />
                </SignedOut>
              </div>
              

              {/* Desktop Icons */}
              <div className="hidden md:flex items-center space-x-4">
                <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 hover:scale-110 transition-all duration-300 ease-in-out transform">
                  <Search className="h-5 w-5 text-gray-700 transition-transform duration-300 hover:rotate-12" />
                </button>
                <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 hover:scale-110 transition-all duration-300 ease-in-out transform">
                  <SignedIn>
              <UserButton />
            </SignedIn>
                </button>
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 hover:scale-110 transition-all duration-300 ease-in-out transform relative"
                >
                  <ShoppingBag className="h-5 w-5 text-gray-700 transition-transform duration-300 hover:rotate-12" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center transition-all duration-300 hover:scale-110">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 hover:scale-110 transition-all duration-300 ease-in-out transform"
                >
                  {isOpen ? (
                    <X className="h-6 w-6 text-gray-700 transition-transform duration-300 rotate-180" />
                  ) : (
                    <Menu className="h-6 w-6 text-gray-700 transition-transform duration-300" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div
            className={`md:hidden backdrop-blur-md bg-white/10 border-t border-white/20 transition-all duration-500 ease-in-out transform ${
              isOpen
                ? "max-h-96 opacity-100 translate-y-0"
                : "max-h-0 opacity-0 -translate-y-4 overflow-hidden"
            }`}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/"
                className="text-gray-700 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 hover:translate-x-2 hover:bg-white/10"
              >
                Home
              </Link>
              <Link
                href="/products"
                className="text-gray-700 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 hover:translate-x-2 hover:bg-white/10"
              >
                Products
              </Link>
              <Link
                href="/categories"
                className="text-gray-700 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 hover:translate-x-2 hover:bg-white/10"
              >
                Categories
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 hover:translate-x-2 hover:bg-white/10"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 hover:translate-x-2 hover:bg-white/10"
              >
                Contact
              </Link>
            </div>
            <div className="space-x-3">
              <SignedOut>
                <SignInButton />
                <SignUpButton />
              </SignedOut>
              
            </div>
            <div className="pt-4 pb-3 border-t border-white/20">
              <div className="flex items-center justify-around px-5">
                <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 hover:scale-110 transition-all duration-300 ease-in-out transform">
                  <Search className="h-5 w-5 text-gray-700 transition-transform duration-300 hover:rotate-12" />
                </button>
                <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 hover:scale-110 transition-all duration-300 ease-in-out transform">
                  <SignedIn>
              <UserButton />
            </SignedIn>
                </button>
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 hover:scale-110 transition-all duration-300 ease-in-out transform relative"
                >
                  <ShoppingBag className="h-5 w-5 text-gray-700 transition-transform duration-300 hover:rotate-12" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center transition-all duration-300 hover:scale-110">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Shopping Cart Sidebar */}
        <div
          className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-gray-50">
              <h2 className="text-xl mx-auto font-semibold text-gray-800">
                Your Cart
              </h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="group shadow-xl bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animationName: isSidebarOpen ? "slideInRight" : "",
                        animationDuration: "0.4s",
                        animationTimingFunction: "ease-out",
                        animationFillMode: "forwards"
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors">
                            {item.name}
                          </h3>
                          <p className="text-lg font-bold text-green-600 mb-3">
                            ${item.price.toFixed(2)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1}
                                className="p-1 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus className="h-4 w-4 text-gray-600" />
                              </button>
                              <span className="w-12 text-center font-semibold text-gray-800">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                              >
                                <Plus className="h-4 w-4 text-gray-600" />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors group/remove"
                            >
                              <Trash2 className="h-4 w-4 text-gray-400 group-hover/remove:text-red-500 transition-colors" />
                            </button>
                          </div>

                          {/* Item Subtotal */}
                          <div className="mt-2 text-right">
                            <span className="text-sm text-gray-500">
                              Subtotal:{" "}
                            </span>
                            <span className="font-semibold text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="bg-gray-50 p-6 space-y-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold text-gray-700">
                    Total (
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                    items):
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <Link href={"/checkout"} onClick={checkout}><button className="w-full my-3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 active:scale-95 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl">
                  Proceed to Checkout
                </button></Link>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>

        <style jsx>{`
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      
    
    </ClerkProvider>
  )
}

export default Navbar