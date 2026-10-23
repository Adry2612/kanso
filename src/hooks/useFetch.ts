import { useCallback, useState } from "react";

type FetchFn<T, Args extends unknown[]> = (...args: Args) => Promise<T>;

export function useFetch<T, Args extends unknown[] = []>(
  fetcher: FetchFn<T, Args>,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        return await fetcher(...args);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetcher],
  );

  return { execute, loading, error };
}
