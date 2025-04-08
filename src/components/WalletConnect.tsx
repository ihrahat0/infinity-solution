'use client';

import { useWalletConnect, SUPPORTED_CHAINS } from '../context/WalletConnectProvider';
import { useWeb3ModalState, useWeb3Modal } from '@web3modal/wagmi/react';

export default function WalletConnectButton() {
  const { address, isConnected, chainId } = useWalletConnect();
  const modal = useWeb3Modal();
  
  // Format the account address for display
  const formatAccount = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Get chain name and icon
  const getChainInfo = (chainId?: number) => {
    if (!chainId) return { name: 'Unknown', icon: '🔗' };
    
    for (const [key, chain] of Object.entries(SUPPORTED_CHAINS)) {
      if (chain.id === chainId) {
        const icons: Record<string, string> = {
          'ETHEREUM': '🔹',
          'POLYGON': '🟣',
          'BSC': '🟡'
        };
        return { 
          name: key, 
          icon: icons[key] || '🔗'
        };
      }
    }
    return { name: 'Unknown', icon: '🔗' };
  };
  
  const chainInfo = getChainInfo(chainId);
  
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={() => modal.open()}
        className="rounded-full border border-solid border-black/[.08] transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] font-medium text-base h-12 px-5 min-w-[200px]"
      >
        {isConnected ? 
          <div className="flex items-center gap-2">
            <span>{chainInfo.icon}</span>
            <span>{formatAccount(address || '')}</span>
            <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full">
              {chainInfo.name}
            </span>
          </div> : 
          'Connect Wallet'
        }
      </button>
    </div>
  );
} 