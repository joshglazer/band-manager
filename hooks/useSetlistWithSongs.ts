'use client';

import { createClient } from '@/utils/supabase/client';
import { Tables } from '@/types/supabase';
import { PostgrestError, useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { useMemo } from 'react';

interface SetlistSongWithSong extends Tables<'setlist_songs'> {
  songs: Tables<'songs'>;
}

interface SetlistWithSongs extends Tables<'setlists'> {
  setlist_songs: SetlistSongWithSong[];
}

interface UseSetlistWithSongsProps {
  setlistId: number;
}

interface UseSetlistWithSongsResult {
  data?: SetlistWithSongs | null;
  isLoading: boolean;
  error?: PostgrestError;
}

export type { SetlistWithSongs, SetlistSongWithSong };

export default function useSetlistWithSongs({ setlistId }: UseSetlistWithSongsProps): UseSetlistWithSongsResult {
  const supabase = createClient();

  const query = useMemo(
    () =>
      supabase
        .from('setlists')
        .select('*, setlist_songs(*, songs(*))')
        .eq('id', setlistId)
        .maybeSingle(),
    [setlistId, supabase]
  );

  const { data, isLoading, error } = useQuery<SetlistWithSongs>(query, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return { data, isLoading, error };
}
