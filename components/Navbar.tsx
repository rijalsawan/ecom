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
  
    const updateQuantity = (id: number, newQuantity: number) => {
      if (newQuantity <= 0) return;
      setCartItems((items) => {
        const updatedItems = items.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        );
        localStorage.setItem('cart', JSON.stringify(updatedItems));
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        return updatedItems;
      });
    };
  
    const removeItem = (id: number) => {
      setCartItems((items) => {
        const updatedItems = items.filter((item) => item.id !== id);
        localStorage.setItem('cart', JSON.stringify(updatedItems));
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        return updatedItems;
      });
    };

    const checkout = () => {
      setIsSidebarOpen(false);
      setCartItems([]);
    };
  
    React.useEffect(() => {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
      
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black shadow-2xl backdrop-blur-3xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                href="/"
                className="text-xl lg:text-2xl font-thin tracking-[0.2em] text-white hover:text-cyan-300 transition-all duration-500 relative"
              >
                <span className="relative z-10">ECOM</span>
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 hover:w-full"></span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <div className="flex items-center space-x-12">
                {['Home', 'Products', 'Categories', 'About', 'Contact'].map((item) => (
                  <Link
                    key={item}
                    href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                    className="text-sm font-light text-white/70 hover:text-white transition-all duration-300 relative group uppercase tracking-wider"
                  >
                    {item}
                    <span className="absolute -bottom-2 left-1/2 w-0 h-px bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Auth & Icons */}
            <div className="flex items-center space-x-4">
              <SignedOut>
                <div className="hidden sm:flex items-center space-x-4">
                  <SignInButton>
                    <button className="text-sm font-light text-white/70 hover:text-white transition-all duration-300 uppercase tracking-wider">
                      Access
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 text-sm font-light rounded-full hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 uppercase tracking-wider shadow-lg hover:shadow-cyan-500/25">
                      Join
                    </button>
                  </SignUpButton>
                </div>
              </SignedOut>
              <SignedIn>
                <div className="relative">
                  <UserButton />
                </div>
              </SignedIn>

              {/* Desktop Icons */}
              <div className="hidden md:flex items-center space-x-2">
                <button className="p-3 rounded-full hover:bg-white/5 transition-all duration-300 group border border-white/10 hover:border-cyan-500/50">
                  <Search className="h-4 w-4 text-white/60 group-hover:text-cyan-400 transition-all duration-300" />
                </button>
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-3 rounded-full hover:bg-white/5 transition-all duration-300 group relative border border-white/10 hover:border-cyan-500/50"
                >
                  <ShoppingBag className="h-4 w-4 text-white/60 group-hover:text-cyan-400 transition-all duration-300" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-light animate-pulse">
                      {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </button>
              </div>

              {/* Mobile cart icon */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-3 rounded-full hover:bg-white/5 transition-all duration-300 group relative border border-white/10"
              >
                <ShoppingBag className="h-4 w-4 text-white/60 group-hover:text-cyan-400 transition-all duration-300" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-light">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>

              {/* Mobile menu button */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-3 rounded-full hover:bg-white/5 transition-all duration-300 border border-white/10"
                >
                  {isOpen ? (
                    <X className="h-5 w-5 text-white/80" />
                  ) : (
                    <Menu className="h-5 w-5 text-white/80" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden bg-black/40 backdrop-blur-3xl border-t border-white/5 transition-all duration-500 ease-out ${
            isOpen
              ? "max-h-screen opacity-100 visible"
              : "max-h-0 opacity-0 invisible overflow-hidden"
          }`}
        >
          <div className="px-4 py-8 space-y-2">
            {['Home', 'Products', 'Categories', 'About', 'Contact'].map((item) => (
              <Link
                key={item}
                href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                className="block px-6 py-4 text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300 font-light uppercase tracking-wider border border-transparent hover:border-white/10"
                onClick={() => setIsOpen(false)}
              >
                {item}
              </Link>
            ))}
            
            {/* Mobile Auth */}
            <SignedOut>
              <div className="pt-6 border-t border-white/10 flex flex-col space-y-4">
                <SignInButton>
                  <button className="text-left px-6 py-4 text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300 font-light uppercase tracking-wider border border-transparent hover:border-white/10">
                    Access
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="mx-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 font-light uppercase tracking-wider">
                    Join
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>
          </div>
        </div>
      </nav>

        {/* Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-500"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Shopping Cart Sidebar */}
        <div
          className={`fixed top-0 right-0 h-full w-full sm:w-96  backdrop-blur-3xl z-50 transform transition-all duration-500 ease-out border-l border-white/10 ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-thin text-white uppercase tracking-[0.2em]">
                Cart
              </h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-3 hover:bg-white/5 rounded-full transition-all duration-300 border border-white/10 hover:border-cyan-500/50"
              >
                <X className="h-4 w-4 text-white/60 hover:text-cyan-400 transition-colors duration-300" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-6">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                    <ShoppingBag className="h-8 w-8 text-white/30" />
                  </div>
                  <p className="text-white/70 text-center font-light text-lg">Cart Empty</p>
                  <p className="text-sm text-white/40 text-center mt-2 font-light uppercase tracking-wider">Add items to begin</p>
                </div>
              ) : (
                <div className="p-6 space-y-8">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="group border-b border-white/10 pb-8 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-xl border border-white/10"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-light text-white mb-2 truncate text-lg">
                                {item.name}
                              </h3>
                              <p className="text-sm text-cyan-400 font-light">
                                ${item.price}
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-2 hover:bg-white/5 rounded-full transition-all duration-300 ml-2 border border-white/10 hover:border-red-500/50"
                            >
                              <Trash2 className="h-4 w-4 text-white/40 hover:text-red-400 transition-colors duration-300" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center border border-white/20 rounded-full bg-white/5 backdrop-blur-sm">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="p-3 hover:bg-white/10 rounded-l-full transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Minus className="h-3 w-3 text-white/60" />
                              </button>
                              <span className="px-6 py-3 font-light text-white min-w-[4rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-3 hover:bg-white/10 rounded-r-full transition-all duration-300"
                              >
                                <Plus className="h-3 w-3 text-white/60" />
                              </button>
                            </div>

                            <span className="text-white font-light text-lg">
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
              <div className="border-t border-white/10 p-6 space-y-8">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-light text-white/60 uppercase tracking-[0.2em]">
                    Total
                  </span>
                  <span className="text-2xl font-thin text-white">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <div className="space-y-8">
                  <Link href="/checkout" onClick={checkout}>
                    <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-full hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 font-light text-sm uppercase tracking-[0.2em] shadow-lg hover:shadow-cyan-500/25">
                      Checkout
                    </button>
                  </Link>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="w-full mt-3 text-white/70 py-4 rounded-full hover:bg-white/5 transition-all duration-300 font-light text-sm uppercase tracking-[0.2em] border border-white/20 hover:border-white/40"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
    </ClerkProvider>
  )
}

export default Navbar
