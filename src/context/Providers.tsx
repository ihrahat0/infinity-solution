'use client';

import { ReactNode } from 'react';
import { WalletConnectProvider } from './WalletConnectProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <WalletConnectProvider>
      {children}
    </WalletConnectProvider>
  );
} 