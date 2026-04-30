'use client';

import { createClient } from '@/utils/supabase/client';
import { PostgrestError, useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { useMemo } from 'react';

interface UseBandMemberEmailsProps {
  bandId: string;
}

interface UseBandMemberEmailsResult {
  data?: { user_id: string; email: string }[] | null;
  isLoading: boolean;
  error?: PostgrestError;
}

export default function useBandMemberEmails({
  bandId,
}: UseBandMemberEmailsProps): UseBandMemberEmailsResult {
  const supabase = createClient();

  const query = useMemo(
    () => supabase.rpc('get_band_member_emails', { band_id_arg: Number(bandId) }),
    [bandId, supabase]
  );

  const { data, isLoading, error } = useQuery<{ user_id: string; email: string }[]>(query, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return { data, isLoading, error };
}
