'use client';

import { SetlistComposite } from '@/types/composites';
import { createClient } from '@/utils/supabase/client';
import { PostgrestError, useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { useMemo } from 'react';

interface UseSetlistProps {
  setlistId: number;
}

interface UseSetlistResult {
  data?: SetlistComposite | null;
  isLoading: boolean;
  error?: PostgrestError;
}

export default function useSetlist({ setlistId }: UseSetlistProps): UseSetlistResult {
  const supabase = createClient();

  const query = useMemo(
    () => supabase.from('setlists').select('*, setlist_songs(*)').eq('id', setlistId).maybeSingle(),
    [setlistId, supabase]
  );

  const { data, isLoading, error } = useQuery<SetlistComposite>(query, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return { data, isLoading, error };
}
