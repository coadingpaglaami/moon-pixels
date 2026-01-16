"use client";

import { useState } from 'react';
import { checkServerConnection } from '@/lib/server-check';

/**
 * Test page to verify server connectivity
 * Visit /server-test to check if the server dependency is working
 */
export default function ServerTestPage() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const testConnection = async () => {
    setStatus('checking');
    setMessage('Checking server connection...');

    const result = await checkServerConnection();

    if (result.isRunning) {
      setStatus('success');
      setMessage('✅ Server is running and accessible!');
    } else {
      setStatus('error');
      setMessage(`❌ Server is not accessible: ${result.error || 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Server Connectivity Test</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl mb-4">Configuration</h2>
          <p className="text-gray-400 mb-2">Server URL:</p>
          <code className="bg-gray-700 px-3 py-2 rounded block">
            {process.env.NEXT_PUBLIC_SERVER_URL || 'http://https://moon-pixels-backend.onrender.com'}
          </code>
        </div>

        <button
          onClick={testConnection}
          disabled={status === 'checking'}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors mb-6"
        >
          {status === 'checking' ? 'Testing...' : 'Test Connection'}
        </button>

        {message && (
          <div className={`p-4 rounded-lg ${
            status === 'success' ? 'bg-green-900/50 border border-green-500' :
            status === 'error' ? 'bg-red-900/50 border border-red-500' :
            'bg-gray-800'
          }`}>
            <p className="text-lg">{message}</p>
          </div>
        )}

        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl mb-4">How It Works</h2>
          <ul className="space-y-2 text-gray-300">
            <li>• The app checks if the server is running before loading</li>
            <li>• If server is down, users see a clear error message</li>
            <li>• No API calls are made - just a simple connectivity check</li>
            <li>• Easy to reuse in other projects</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
