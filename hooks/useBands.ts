import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import {
  PostgrestError,
  useQuery,
} from '@supabase-cache-helpers/postgrest-swr';
import { useMemo } from 'react';

interface UseBandsResult {
  data?: Tables<'bands'>[] | null;
  isLoading: boolean;
  error?: PostgrestError;
}

export default function useBands(): UseBandsResult {
  const supabase = createClient();

  const query = useMemo(
    () =>
      supabase
        .from('bands')
        .select('id, name, created_at')
        .order('name', { ascending: true }),
    [supabase]
  );

  const { data, isLoading, error } = useQuery<Tables<'bands'>[]>(query, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return { data, isLoading, error };
}
