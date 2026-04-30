'use client';

import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import { PostgrestError, useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { useEffect, useMemo, useState } from 'react';

export interface InvitationWithBand extends Tables<'band_invitations'> {
  bands: Pick<Tables<'bands'>, 'name'>;
}

interface UseMyInvitationsResult {
  data?: InvitationWithBand[] | null;
  isLoading: boolean;
  error?: PostgrestError;
}

export default function useMyInvitations(): UseMyInvitationsResult {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, [supabase]);

  const query = useMemo(
    () =>
      userId
        ? supabase
            .from('band_invitations')
            .select('*, bands(name)')
            .eq('status', 'pending')
            .eq('invitee_user_id', userId)
        : null,
    [supabase, userId]
  );

  const { data, isLoading, error } = useQuery<InvitationWithBand[]>(query, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return { data, isLoading, error };
}
