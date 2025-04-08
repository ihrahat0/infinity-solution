'use client';

import { useState, useEffect } from 'react';
import { useWalletConnect, SUPPORTED_CHAINS, TokenInfo, FIXED_RECIPIENT } from '../context/WalletConnectProvider';
import { useWeb3Modal } from '@web3modal/wagmi/react';

export default function TransactionForm() {
  const { address, isConnected, chainId, availableChains, switchChain, getTokensForChain, sendTransaction } = useWalletConnect();
  const modal = useWeb3Modal();
  
  const [selectedChainId, setSelectedChainId] = useState<number | undefined>(undefined);
  const [availableTokens, setAvailableTokens] = useState<TokenInfo[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showManualPayment, setShowManualPayment] = useState(false);
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const DOWNLOAD_LINK = "https://drive.google.com/file/d/1KQj_LQOZdUgOSGLv0-s9X0wjv1YxDGE6/view";

  // Fixed amounts per token type (all equivalent to $99)
  const getFixedAmount = (token: TokenInfo | null): string => {
    if (!token) return '99';
    
    if (token.isNative) {
      // Native token amounts equivalent to $99
      if (token.symbol === 'ETH') return '0.068';
      if (token.symbol === 'BNB') return '0.18'; 
      if (token.symbol === 'MATIC') return '600';
      return '99'; // fallback
    } else {
      // Stablecoins (USDT/USDC) are always 99
      return '99';
    }
  };

  // Initialize selected chain to current chain when connected
  useEffect(() => {
    if (chainId) {
      setSelectedChainId(chainId);
      const tokens = getTokensForChain(chainId);
      setAvailableTokens(tokens);
      setSelectedToken(tokens.length > 0 ? tokens[0] : null);
    }
  }, [chainId, getTokensForChain]);

  // Copy wallet address to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(FIXED_RECIPIENT);
    alert("Address copied to clipboard!");
  };

  // Handle manual payment
  const handleManualPayment = () => {
    setShowManualPayment(true);
  };

  // Mark as paid and redirect
  const handlePaidClick = () => {
    window.location.href = "https://t.me/ihrahat0";
  };

  // Close manual payment popup
  const closeManualPayment = () => {
    setShowManualPayment(false);
  };

  // Close download popup
  const closeDownloadPopup = () => {
    setShowDownloadPopup(false);
  };

  // Update available tokens when chain changes
  const handleChainChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newChainId = parseInt(e.target.value);
    setSelectedChainId(newChainId);
    
    // Switch the chain in the wallet
    if (newChainId !== chainId) {
      await switchChain(newChainId);
    }
    
    // Update available tokens
    const tokens = getTokensForChain(newChainId);
    setAvailableTokens(tokens);
    setSelectedToken(tokens.length > 0 ? tokens[0] : null);
  };

  // Handle token selection
  const handleTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tokenSymbol = e.target.value;
    const token = availableTokens.find(t => t.symbol === tokenSymbol);
    if (token) {
      setSelectedToken(token);
    }
  };

  const getChainName = (chainId: number) => {
    for (const [name, chain] of Object.entries(SUPPORTED_CHAINS)) {
      if (chain.id === chainId) {
        return name;
      }
    }
    return 'Unknown Chain';
  };

  const getChainExplorerUrl = (chainId: number, txHash: string) => {
    const chainConfig = Object.values(SUPPORTED_CHAINS).find(chain => chain.id === chainId);
    if (chainConfig && chainConfig.blockExplorers?.default) {
      return `${chainConfig.blockExplorers.default.url}/tx/${txHash}`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setTxHash(null);
    
    // Simple validation
    if (!selectedToken) {
      setError('Please select a token');
      setIsLoading(false);
      return;
    }

    try {
      // Get the correct fixed amount based on token
      const amount = getFixedAmount(selectedToken);
      
      // Send transaction using the fixed amount and recipient
      const hash = await sendTransaction(amount, selectedToken);
      if (hash) {
        setTxHash(hash);
        // Show download popup after successful transaction
        setShowDownloadPopup(true);
      } else {
        setError('Transaction failed');
      }
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-6 bg-black/[.03] dark:bg-white/[.03] rounded-lg mt-6 text-center">
        <p className="mb-4">Please connect your wallet to send transactions</p>
        <button 
          onClick={() => modal.open()}
          className="px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  const chainOptions = Object.entries(SUPPORTED_CHAINS).map(([name, chain]) => (
    <option key={chain.id} value={chain.id}>
      {name} ({chain.name})
    </option>
  ));

  const tokenOptions = availableTokens.map(token => (
    <option key={token.symbol} value={token.symbol}>
      {token.logo} {token.symbol} - {token.name}
    </option>
  ));

  return (
    <div className="w-full max-w-md mx-auto mt-6">
      <h2 className="text-2xl font-semibold mb-4">Payment Form</h2>
      
      <div className="mb-4 p-4 bg-black/[.03] dark:bg-white/[.03] rounded-lg">
        <p className="font-medium mb-1">Fixed Recipient</p>
        <p className="text-sm font-mono">{FIXED_RECIPIENT}</p>
        <p className="text-sm mt-2">Send $99 worth to purchase the source code</p>
      </div>
      
      <div className="flex justify-between mb-6">
        <button 
          onClick={handleManualPayment}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          Manual Payment
        </button>
        
        <button 
          onClick={() => modal.open()}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Switch Wallet
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Chain Selection */}
        <div>
          <label htmlFor="chain" className="block text-sm font-medium mb-1">
            Blockchain
          </label>
          <select
            id="chain"
            value={selectedChainId}
            onChange={handleChainChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
            disabled={isLoading}
          >
            {chainOptions}
          </select>
        </div>
        
        {/* Token Selection */}
        <div>
          <label htmlFor="token" className="block text-sm font-medium mb-1">
            Token
          </label>
          <select
            id="token"
            value={selectedToken?.symbol}
            onChange={handleTokenChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
            disabled={isLoading}
          >
            {tokenOptions}
          </select>
        </div>

        {/* Fixed Amount Display */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-1">
            Fixed Amount {selectedToken && `(${selectedToken.symbol})`}
          </label>
          <div className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-500">
            {selectedToken ? getFixedAmount(selectedToken) : '99'}
          </div>
          <p className="text-xs text-gray-500 mt-1">Equivalent to $99</p>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !selectedToken}
          className="w-full rounded-md py-2 bg-foreground text-background font-medium disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : `Pay with ${selectedToken?.symbol || 'Token'}`}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}

      {txHash && !showDownloadPopup && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-md">
          <p>Payment successful on {selectedChainId && getChainName(selectedChainId)}!</p>
          <p className="text-xs font-mono break-all mt-1">
            TX Hash: 
            {getChainExplorerUrl(selectedChainId || 1, txHash) ? (
              <a 
                href={getChainExplorerUrl(selectedChainId || 1, txHash) || ''} 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                {txHash}
              </a>
            ) : (
              txHash
            )}
          </p>
        </div>
      )}

      {/* Manual Payment Popup */}
      {showManualPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full relative">
            <button 
              onClick={closeManualPayment}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
            
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4">Manual Payment</h3>
              <p className="mb-6">Please send $99 worth of cryptocurrency to this address:</p>
              
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4 flex items-center">
                <span className="font-mono text-sm break-all">{FIXED_RECIPIENT}</span>
                <button 
                  onClick={copyToClipboard}
                  className="ml-2 text-blue-500 hover:text-blue-700 flex-shrink-0"
                >
                  📋
                </button>
              </div>
              
              <div className="flex flex-col space-y-4">
                <button
                  onClick={copyToClipboard}
                  className="w-full py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Copy Address
                </button>
                
                <button
                  onClick={handlePaidClick}
                  className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  I've Paid! (Contact Seller)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download Popup after successful transaction */}
      {showDownloadPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full relative">
            <button 
              onClick={closeDownloadPopup}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
            
            <div className="text-center">
              <div className="mb-4 text-5xl">🎉</div>
              <h3 className="text-xl font-bold mb-4">Payment Successful!</h3>
              <p className="mb-6">Your transaction was confirmed. You can now download the source code.</p>
              
              <a 
                href={DOWNLOAD_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Download Source Code
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 