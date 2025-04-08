'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductCardProps {
  onBuyNow: () => void;
}

export default function ProductCard({ onBuyNow }: ProductCardProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  
  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="md:flex">
        {/* Product Image / Video Section */}
        <div className="md:flex-shrink-0 relative h-64 md:h-auto md:w-1/2 cursor-pointer" onClick={() => setIsVideoOpen(true)}>
          <div className="relative w-full h-full">
            <Image 
              src="https://images.unsplash.com/photo-1566837945700-30057527ade0?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80"
              alt="Blockchain Source Code"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <div className="w-16 h-16 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-red-600 border-b-8 border-b-transparent ml-1"></div>
              </div>
              <span className="absolute bottom-4 right-4 px-2 py-1 bg-red-600 text-white text-xs rounded">Watch Demo</span>
            </div>
          </div>
        </div>
        
        {/* Product Info Section */}
        <div className="p-8 md:w-1/2">
          <div className="tracking-wide text-sm text-indigo-500 font-semibold mb-1">Multi-Chain Swap</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Supported chains : Ethereum, Binance Smart chain, Base, Solana</h1>
          <div className="text-3xl font-bold text-green-600 mb-4">$99.00</div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4">
           Supporting Dexs are Uniswap, Pancakeswap, 1Inch, Raydium, Jupiter. Also all pump.fun tokens will be swapable.
          </p>
          
          <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4 my-4">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">Multi-Chain Support</span>
            </div>
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">Recieve Fee's</span>
            </div>
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">React & Next.js Integration</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">Full Documentation & Support</span>
            </div>
          </div>
          
          <button
            onClick={onBuyNow}
            className="w-full bg-foreground text-background py-3 rounded-md font-semibold hover:bg-black/80 dark:hover:bg-white/80 transition-colors"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* YouTube Video Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-4xl bg-black">
            <button 
              onClick={() => setIsVideoOpen(false)}
              className="absolute -top-10 right-0 text-white text-xl hover:text-gray-300"
            >
              Close ✕
            </button>
            <div className="relative pb-[56.25%] h-0">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/jzblEVYfh6o"
                title="Multi-Chain Swap Source code"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 