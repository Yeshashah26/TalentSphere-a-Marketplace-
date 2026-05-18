import { useState, useEffect, useCallback } from 'react';

/** Fetch data from API with auto-refresh on talentsphere-update */
export function useAsyncData(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.resolve(fetcher())
      .then((result) => {
        if (!cancelled) setData(result ?? null);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('talentsphere-update', handler);
    return () => window.removeEventListener('talentsphere-update', handler);
  }, [refresh]);

  return { data, loading, refresh, setData };
}
