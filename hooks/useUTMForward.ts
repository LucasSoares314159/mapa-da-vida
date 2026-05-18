'use client';

import { useMemo } from 'react';

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

export function useUTMForward(baseUrl: string): string {
  return useMemo(() => {
    if (typeof window === 'undefined') return baseUrl;

    const search = new URLSearchParams(window.location.search);
    const target = new URL(baseUrl);

    UTM_PARAMS.forEach(key => {
      const val = search.get(key);
      if (val) target.searchParams.set(key, val);
    });

    return target.toString();
  }, [baseUrl]);
}
