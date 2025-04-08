'use client';

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Import the ProductCard component
const ProductCard = dynamic(() => import('../components/ProductCard'), {
  ssr: false
});

// Use dynamic imports with ssr: false to avoid hydration mismatch
const WalletConnectButton = dynamic(
  () => import('../components/WalletConnect'),
  { ssr: false }
);

const TransactionForm = dynamic(
  () => import('../components/TransactionForm'),
  { ssr: false }
);

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Only show the UI after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBuyNow = () => {
    setShowPayment(true);
    // Scroll to payment section
    setTimeout(() => {
      document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center w-full max-w-5xl">
        <div className="flex flex-col items-center gap-4 w-full">
          <h1 className="text-3xl font-bold mb-2 text-center">Web3 Multi-Chain Integration Kit</h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6 max-w-2xl">
            Professional source code for adding multi-chain wallet integrations to your projects. 
            Support for Ethereum, BSC, and Polygon with seamless token transfers.
          </p>
          
          {mounted && (
            <>
              <div className="mb-10 w-full">
                <ProductCard onBuyNow={handleBuyNow} />
              </div>
              
              <div id="payment-section" className={`w-full transition-all duration-500 ${showPayment ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                {showPayment && (
                  <>
                    <h2 className="text-2xl font-bold mb-6 text-center">Complete Your Purchase</h2>
                    <div className="flex flex-col items-center mb-4">
                      <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
                        Connect your wallet to pay $99 using your preferred cryptocurrency
                      </p>
                      <Suspense fallback={<div>Loading wallet connect...</div>}>
                        <WalletConnectButton />
                      </Suspense>
                    </div>
                    
                    <Suspense fallback={<div>Loading transaction form...</div>}>
                      <TransactionForm />
                    </Suspense>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
       
        <div className="w-full flex flex-wrap justify-center mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p className="text-center">
            Need help? Contact us: 
            <a 
              href="mailto:programmer.ihrahat@gmail.com" 
              className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
            >
              programmer.ihrahat@gmail.com
            </a> 
            <span className="mx-1">or</span> 
            <a 
              href="https://t.me/ihrahat0" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Telegram: @ihrahat0
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
