import { auth } from '../firebase';

/**
 * Safe JSON fetch utility that handles retries, content-type checks,
 * and automatic Firebase Auth Bearer token injection.
 */
export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit,
  retries: number = 2,
  delayMs: number = 1000
): Promise<T | null> {
  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {})
  };

  // Automatically attach ID Token if available and not explicitly provided
  if (auth.currentUser && !headers['Authorization']) {
    try {
      const token = await auth.currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch {
      // Continue without token if fetch fails
    }
  }

  const mergedOptions: RequestInit = {
    ...options,
    headers
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, mergedOptions);
      const contentType = res.headers.get('content-type') || '';

      if (res.ok && contentType.includes('application/json')) {
        return (await res.json()) as T;
      }

      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }

      return null;
    } catch (err: any) {
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      console.warn(`API notice [${url}]:`, err?.message || err);
      return null;
    }
  }
  return null;
}

/**
 * Get current ID Token for raw fetch requests if needed
 */
export async function getAuthToken(): Promise<string | null> {
  if (!auth.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken();
  } catch {
    return null;
  }
}
