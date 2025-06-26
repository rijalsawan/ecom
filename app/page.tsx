'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className=" bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        
        <motion.main 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center text-center py-20 lg:py-32"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-light text-gray-900 mb-6 leading-tight">
            Shop the <span className="text-gray-900 font-medium">Future</span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 mb-8 lg:mb-12 max-w-2xl font-light leading-relaxed">
            Discover premium products with modern design and exceptional quality. Your journey to better living starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
            <Link 
              href="/products" 
              className="bg-gray-900 text-white px-6 lg:px-8 py-3 lg:py-4 text-sm lg:text-base font-medium hover:bg-gray-800 transition-all duration-300"
            >
              Explore Products
            </Link>
          </div>
        </motion.main>
      </div>

      <div>
        <motion.div 
          className="fixed bottom-0 left-0 w-full h-1 bg-gray-900"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
        <motion.div
          className="fixed bottom-0 left-0 w-full h-1 bg-gray-900"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: 'easeInOut', delay: 2 }}
        />
        <Link className='
          fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all duration-300 z-50
        
        ' href={"/admin"}>Access Admin Panel</Link>
      </div>

      <div 
        className="fixed w-4 h-4 bg-gray-900 pointer-events-none z-50 opacity-20 transition-opacity duration-300"
        style={{
          left: mousePosition.x - 8,
          top: mousePosition.y - 8,
          opacity: isVisible ? 0.2 : 0
        }}
      />
      </div>
  );
}
