import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { searchAll } from "@/services/client/search";
import type { SearchResponse } from "@/services/client/search";

export function useAlbumSearch(query: string) {
  const debouncedQuery = useDebounce(query, 500);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const term = debouncedQuery.trim();

    if (!term) {
      setResult(null);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    searchAll(term, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult(data);
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setResult(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQuery, reloadToken]);

  return {
    debouncedQuery,
    result,
    loading,
    error,
    retry: useCallback(() => setReloadToken((value) => value + 1), []),
  };
}
