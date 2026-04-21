'use client';

import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import { PostgrestError, useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { useMemo } from 'react';

interface UseBandInvitationsProps {
  bandId: number;
}

interface UseBandInvitationsResult {
  data?: Tables<'band_invitations'>[] | null;
  isLoading: boolean;
  error?: PostgrestError;
}

export default function useBandInvitations({ bandId }: UseBandInvitationsProps): UseBandInvitationsResult {
  const supabase = createClient();

  const query = useMemo(
    () =>
      supabase
        .from('band_invitations')
        .select()
        .eq('band_id', bandId)
        .eq('status', 'pending'),
    [bandId, supabase]
  );

  const { data, isLoading, error } = useQuery<Tables<'band_invitations'>[]>(query, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return { data, isLoading, error };
}
