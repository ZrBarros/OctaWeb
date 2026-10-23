"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "./api";

export function useApiData<T>(path: string, initial: T, auth = false) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reload = useCallback(async () => {
    setLoading(true); setError("");
    try { setData(await apiClient<T>(path, { auth })); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível carregar os dados."); }
    finally { setLoading(false); }
  }, [auth, path]);
  useEffect(() => {
    let active = true;
    apiClient<T>(path, { auth }).then((result) => { if (active) { setData(result); setError(""); } }, (reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Não foi possível carregar os dados."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [auth, path]);
  return { data, setData, loading, error, reload };
}
