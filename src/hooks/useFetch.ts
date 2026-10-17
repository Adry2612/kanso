/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useFetch.ts
import { useCallback, useState } from "react";

type FetchFn<T = any> = (...args: any[]) => Promise<T>;

export function useFetch<T = any>(fetcher: FetchFn<T>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetcher(...args);
        return result;
      } catch (err: any) {
        setError(err.message || "Error desconocido");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetcher],
  );

  return { execute, loading, error };
}
