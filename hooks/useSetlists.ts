'use client';

import { SetlistComposite } from '@/types/composites';
import { createClient } from '@/utils/supabase/client';
import { PostgrestError, useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { useMemo } from 'react';

interface UseSetlistsProps {
  bandId: number;
}

interface UseSetlistsResult {
  data?: SetlistComposite[] | null;
  isLoading: boolean;
  error?: PostgrestError;
}

export default function useSetlists({ bandId }: UseSetlistsProps): UseSetlistsResult {
  const supabase = createClient();

  const query = useMemo(
    () => supabase.from('setlists').select('*, setlist_songs(*)').eq('band_id', bandId),
    [bandId, supabase]
  );

  const { data, isLoading, error } = useQuery<SetlistComposite[]>(query, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return { data, isLoading, error };
}
