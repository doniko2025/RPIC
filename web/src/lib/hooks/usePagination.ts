"use client";
import { useState, useCallback } from "react";
import { api, buildQuery, type PagedResponse, type PaginationMeta, type ApiError } from "@/lib/api";

interface Options { limit?: number; initialFilters?: Record<string, string>; }

export function usePagination<T>(basePath: string, opts: Options = {}) {
  const { limit = 20, initialFilters = {} } = opts;
  const [data,    setData]    = useState<T[]>([]);
  const [meta,    setMeta]    = useState<PaginationMeta>({ page:1, limit, total:0, totalPages:1 });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters);

  const load = useCallback(async (page = 1, f = filters) => {
    setLoading(true); setError(null);
    try {
      const q = buildQuery({ page, limit, ...f });
      const res = await api.get<PagedResponse<T> & { data: T[]; meta: PaginationMeta }>(
        `${basePath}${q}`
      );
      setData((res as unknown as {data:T[];meta:PaginationMeta}).data ?? res as unknown as T[]);
      setMeta((res as unknown as {data:T[];meta:PaginationMeta}).meta ?? meta);
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setLoading(false);
    }
  }, [basePath, limit, filters]);

  const setFilter = useCallback((key: string, value: string) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    load(1, next);
  }, [filters, load]);

  const goToPage = useCallback((p: number) => load(p), [load]);

  return { data, meta, loading, error, load, setFilter, filters, goToPage };
}
