'use client';

import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import { PostgrestError, useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { useMemo } from 'react';

interface UseVoteSessionsProps {
  bandId: number;
}

interface UseVoteSessionsResult {
  data?: Tables<'vote_sessions'>[] | null;
  isLoading: boolean;
  error?: PostgrestError;
  mutate: () => void;
}

export default function useVoteSessions({ bandId }: UseVoteSessionsProps): UseVoteSessionsResult {
  const supabase = createClient();

  const query = useMemo(
    () =>
      supabase
        .from('vote_sessions')
        .select('*')
        .eq('band_id', bandId)
        .order('created_at', { ascending: false }),
    [bandId, supabase]
  );

  const { data, isLoading, error, mutate } = useQuery<Tables<'vote_sessions'>[]>(query, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return { data, isLoading, error, mutate };
}
