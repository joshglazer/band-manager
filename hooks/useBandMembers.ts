'use client';

import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import { PostgrestError, useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { useMemo } from 'react';

interface UseBandMembersProps {
  bandId: number;
}

interface UseBandMembersResult {
  data?: Tables<'band_members'>[] | null;
  isLoading: boolean;
  error?: PostgrestError;
}

export default function useBandMembers({ bandId }: UseBandMembersProps): UseBandMembersResult {
  const supabase = createClient();

  const query = useMemo(
    () => supabase.from('band_members').select().eq('band_id', bandId),
    [bandId, supabase]
  );

  const { data, isLoading, error } = useQuery<Tables<'band_members'>[]>(query, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return { data, isLoading, error };
}
