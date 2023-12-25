'use client';

import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import {
  PostgrestError,
  useQuery,
} from '@supabase-cache-helpers/postgrest-swr';
import { useMemo } from 'react';

interface UseSongsProps {
  bandId: number;
}

interface UseSongsResult {
  data?: Tables<'songs'>[] | null;
  isLoading: boolean;
  error?: PostgrestError;
}

export default function useSongs({ bandId }: UseSongsProps): UseSongsResult {
  const supabase = createClient();

  const query = useMemo(
    () => supabase.from('songs').select().eq('band_id', bandId),
    [bandId, supabase]
  );

  const { data, isLoading, error } = useQuery<Tables<'songs'>[]>(query, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return { data, isLoading, error };
}
