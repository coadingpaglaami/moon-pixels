//config/index.ts
'use client';

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { monadTestnet } from '@reown/appkit/networks';

let wallet_wagmiAdapter: WagmiAdapter | null = null;
let appKitInitialized = false;

export function getWagmiAdapter() {
  if (!wallet_wagmiAdapter && typeof window !== 'undefined') {
    wallet_wagmiAdapter = new WagmiAdapter({
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
      networks: [monadTestnet],
    });
  }
  return wallet_wagmiAdapter!;
}

export function initializeAppKit() {
  if (typeof window !== 'undefined' && !appKitInitialized) {
    const adapter = getWagmiAdapter();
    createAppKit({
      adapters: [adapter],
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
      networks: [monadTestnet],
      features:{
        email: false,
        socials: [],
        onramp: false,
        swaps: false,
        history: false,
        send: true
      }
    });
    appKitInitialized = true;
  }
}


