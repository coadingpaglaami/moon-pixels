"use client";

import { useEffect, useState } from 'react';
import { checkServerConnection } from '@/lib/server-check';

interface ServerGuardProps {
  children: React.ReactNode;
}

/**
 * ServerGuard Component
 * 
 * Prevents app from rendering until backend server is confirmed running.
 * Shows loading state while checking, error state if server is down.
 * 
 * Reusable across projects - just wrap your app content with this component.
 */
export default function ServerGuard({ children }: ServerGuardProps) {
  const [serverStatus, setServerStatus] = useState<'checking' | 'running' | 'down'>('checking');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const checkServer = async () => {
      const result = await checkServerConnection();

      if (!isMounted) return;

      if (result.isRunning) {
        setServerStatus('running');
      } else {
        setServerStatus('down');
      }
    };

    checkServer();

    return () => {
      isMounted = false;
    };
  }, [retryCount]);

  const handleRetry = () => {
    setServerStatus('checking');
    setRetryCount(prev => prev + 1);
  };

  if (serverStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <h2 className="text-xl text-white mb-2">Connecting to server...</h2>
          <p className="text-gray-400">Please wait while we verify the backend is running</p>
        </div>
      </div>
    );
  }

  if (serverStatus === 'down') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md px-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl text-white mb-4 font-bold">Server Not Running</h2>
          <p className="text-gray-300 mb-6">
            The backend server is not accessible. Please start the server before using the application.
          </p>
          <div className="bg-gray-800 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-400 mb-2">To start the server, run:</p>
            <code className="text-green-400 text-sm">npm run start-server</code>
            <p className="text-sm text-gray-400 mt-3 mb-2">Or start both together:</p>
            <code className="text-green-400 text-sm">npm start</code>
          </div>
          <button
            onClick={handleRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
