'use client';

import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import {
  PostgrestError,
  useQuery,
} from '@supabase-cache-helpers/postgrest-swr';
import { useMemo } from 'react';

interface UseBandProps {
  bandId: number;
}

interface UseBandResult {
  data?: Tables<'bands'> | null;
  isLoading: boolean;
  error?: PostgrestError;
}

export default function useBands({ bandId }: UseBandProps): UseBandResult {
  const supabase = createClient();

  const query = useMemo(
    () => supabase.from('bands').select().eq('id', bandId).maybeSingle(),
    [bandId, supabase]
  );

  const { data, isLoading, error } = useQuery<Tables<'bands'>>(query, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return { data, isLoading, error };
}
