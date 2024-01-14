'use client';

import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import {
  PostgrestError,
  useQuery,
} from '@supabase-cache-helpers/postgrest-swr';
import { useMemo } from 'react';

export interface BandsComposite extends Tables<'bands'> {
  songs: {
    count: number;
  }[];
  band_members: {
    count: number;
  }[];
}

interface UseBandsResult {
  data?: BandsComposite[] | null;
  isLoading: boolean;
  error?: PostgrestError;
}

export default function useBands(): UseBandsResult {
  const supabase = createClient();

  const query = useMemo(
    () =>
      supabase
        .from('bands')
        .select('id, name, created_at, songs(count), band_members(count)')
        .order('name', { ascending: true }),
    [supabase]
  );

  const { data, isLoading, error } = useQuery<BandsComposite[]>(query, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return { data, isLoading, error };
}
