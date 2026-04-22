'use client';

import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import { PostgrestError, useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { useMemo } from 'react';

interface UseChordChartProps {
  songId: number;
}

interface UseChordChartResult {
  data?: Tables<'chord_charts'> | null;
  isLoading: boolean;
  error?: PostgrestError;
  mutate: () => void;
}

export default function useChordChart({ songId }: UseChordChartProps): UseChordChartResult {
  const supabase = createClient();

  const query = useMemo(
    () => supabase.from('chord_charts').select('*').eq('song_id', songId).maybeSingle(),
    [songId, supabase]
  );

  const { data, isLoading, error, mutate } = useQuery<Tables<'chord_charts'>>(query, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return { data, isLoading, error, mutate };
}
