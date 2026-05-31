"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { api, type ApiError } from "@/lib/api";

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(path: string | null): UseApiState<T> {
  const [data,    setData]    = useState<T | null>(null);
  const [loading, setLoading] = useState(!!path);
  const [error,   setError]   = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetch = useCallback(async () => {
    if (!path) return;
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const d = await api.get<T>(path);
      setData(d);
    } catch (e) {
      setError((e as ApiError).message ?? "Erreur");
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => { fetch(); return () => abortRef.current?.abort(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
