'use client';

import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import {
  PostgrestError,
  useQuery,
} from '@supabase-cache-helpers/postgrest-swr';
import { useMemo } from 'react';

interface UseSetlistsProps {
  bandId: number;
}

interface UseSetlistsResult {
  data?: Tables<'setlists'>[] | null;
  isLoading: boolean;
  error?: PostgrestError;
}

export default function useSetlists({
  bandId,
}: UseSetlistsProps): UseSetlistsResult {
  const supabase = createClient();

  const query = useMemo(
    () => supabase.from('setlists').select().eq('band_id', bandId),
    [bandId, supabase]
  );

  const { data, isLoading, error } = useQuery<Tables<'setlists'>[]>(query, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return { data, isLoading, error };
}
