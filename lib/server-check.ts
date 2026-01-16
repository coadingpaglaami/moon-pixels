/**
 * Server Connectivity Checker
 * 
 * Simple utility to verify backend server is running before allowing
 * frontend to load. Reusable across projects - just update SERVER_URL.
 */

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://moon-pixels-backend.onrender.com';
const CHECK_TIMEOUT = 5000; // 5 seconds
const RETRY_INTERVAL = 2000; // 2 seconds between retries

interface ServerCheckResult {
  isRunning: boolean;
  error?: string;
}

/**
 * Check if server is reachable
 * Makes a simple fetch request to verify connectivity
 */
export async function checkServerConnection(): Promise<ServerCheckResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CHECK_TIMEOUT);

    const response = await fetch(SERVER_URL, {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    return {
      isRunning: response.ok || response.status < 500,
    };
  } catch (error) {
    return {
      isRunning: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Wait for server to be available with retries
 * Useful during development when server might start after frontend
 */
export async function waitForServer(maxRetries = 3): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    const result = await checkServerConnection();
    
    if (result.isRunning) {
      return true;
    }

    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
    }
  }

  return false;
}

/**
 * Block app initialization until server is available
 * Throws error if server is not reachable after retries
 */
export async function requireServer(): Promise<void> {
  const isAvailable = await waitForServer();

  if (!isAvailable) {
    throw new Error(
      `Backend server is not running at ${SERVER_URL}. ` +
      `Please start the server before running the frontend.`
    );
  }
}
