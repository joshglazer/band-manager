'use client';

import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import { PostgrestError, useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { useMemo } from 'react';

interface UseUserProfilesProps {
  userId: string;
}

interface UseUserProfilesResult {
  data?: Tables<'user_profiles'> | null;
  isLoading: boolean;
  error?: PostgrestError;
}

export default function useUserProfiles({ userId }: UseUserProfilesProps): UseUserProfilesResult {
  const supabase = createClient();

  const query = useMemo(
    () => supabase.from('user_profiles').select().eq('user_id', userId).maybeSingle(),
    [userId, supabase]
  );

  const { data, isLoading, error } = useQuery<Tables<'user_profiles'>>(query, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return { data, isLoading, error };
}
