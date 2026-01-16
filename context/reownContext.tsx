// context/index.tsx
'use client';

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, type Config } from 'wagmi';

const queryClient = new QueryClient();

export function ReownProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [wagmiConfig, setWagmiConfig] = useState<Config | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Dynamically import and initialize only on client
    import('@/config/reownConfig').then(({ getWagmiAdapter, initializeAppKit }) => {
      const adapter = getWagmiAdapter();
      setWagmiConfig(adapter.wagmiConfig);
      initializeAppKit();
    });
  }, []);

  if (!mounted || !wagmiConfig) {
    return null;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
