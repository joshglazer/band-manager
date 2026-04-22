'use client';

import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import { PostgrestError, useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { useMemo } from 'react';

interface UseSongProps {
  songId: number;
}

interface UseSongResult {
  data?: Tables<'songs'> | null;
  isLoading: boolean;
  error?: PostgrestError;
  mutate: () => void;
}

export default function useSong({ songId }: UseSongProps): UseSongResult {
  const supabase = createClient();

  const query = useMemo(
    () => supabase.from('songs').select('*').eq('id', songId).maybeSingle(),
    [songId, supabase]
  );

  const { data, isLoading, error, mutate } = useQuery<Tables<'songs'>>(query, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return { data, isLoading, error, mutate };
}
