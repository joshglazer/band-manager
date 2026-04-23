'use client';

import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import { PostgrestError, useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { useMemo } from 'react';

interface UsePracticeProgressProps {
  bandId: number;
}

export interface SongWithProgress extends Tables<'songs'> {
  practice_progress: {
    id: number;
    status: string;
    notes: string | null;
  }[];
}

interface UsePracticeProgressResult {
  data?: SongWithProgress[] | null;
  isLoading: boolean;
  error?: PostgrestError;
  mutate: () => void;
}

export default function usePracticeProgress({
  bandId,
}: UsePracticeProgressProps): UsePracticeProgressResult {
  const supabase = createClient();

  const query = useMemo(
    () =>
      supabase
        .from('songs')
        .select('*, practice_progress(id, status, notes)')
        .eq('band_id', bandId),
    [bandId, supabase]
  );

  const { data, isLoading, error, mutate } = useQuery<SongWithProgress[]>(query, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return { data, isLoading, error, mutate };
}
