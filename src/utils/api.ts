/**
 * Safe JSON fetch utility that prevents syntax errors when the server
 * returns HTML (e.g. during cold starts or proxy restarts).
 */
export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit,
  retries: number = 2,
  delayMs: number = 1000
): Promise<T | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      const contentType = res.headers.get('content-type') || '';

      // Check if response is successful and has JSON content type
      if (res.ok && contentType.includes('application/json')) {
        return (await res.json()) as T;
      }

      // If server returned non-JSON (like HTML during bootup), wait and retry
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
