'use client';

import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import { PostgrestError, useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { useMemo } from 'react';

interface UsePracticeProgressProps {
  bandId: number;
}

export type PracticeProgressRow = Pick<
  Tables<'practice_progress'>,
  'id' | 'song_id' | 'status' | 'notes'
>;

interface UsePracticeProgressResult {
  data?: PracticeProgressRow[] | null;
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
        .from('practice_progress')
        .select('id, song_id, status, notes')
        .eq('band_id', bandId),
    [bandId, supabase]
  );

  const { data, isLoading, error, mutate } = useQuery<PracticeProgressRow[]>(query, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return { data, isLoading, error, mutate };
}
