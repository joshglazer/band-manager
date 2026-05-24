'use client';

import { VoteSessionWithDetails } from '@/types/composites';
import { createClient } from '@/utils/supabase/client';
import { PostgrestError, useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { useMemo } from 'react';

interface UseVoteSessionProps {
  voteSessionId: number;
}

interface UseVoteSessionResult {
  data?: VoteSessionWithDetails | null;
  isLoading: boolean;
  error?: PostgrestError;
  mutate: () => void;
}

export default function useVoteSession({ voteSessionId }: UseVoteSessionProps): UseVoteSessionResult {
  const supabase = createClient();

  const query = useMemo(
    () =>
      supabase
        .from('vote_sessions')
        .select(
          `*,
          vote_proposals (
            *,
            vote_ballots (*),
            user_profiles (first_name, last_name)
          )`
        )
        .eq('id', voteSessionId)
        .maybeSingle(),
    [voteSessionId, supabase]
  );

  const { data, isLoading, error, mutate } = useQuery<VoteSessionWithDetails>(query, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return { data, isLoading, error, mutate };
}
