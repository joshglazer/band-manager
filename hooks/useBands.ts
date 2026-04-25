'use client';

import { createClient } from '@/utils/supabase/client';
import useSWR from 'swr';

export interface BandsComposite {
  id: number;
  name: string;
  created_at: string;
  song_count: number;
  member_count: number;
}

interface UseBandsResult {
  data?: BandsComposite[] | null;
  isLoading: boolean;
  error?: Error;
}

export default function useBands(): UseBandsResult {
  const supabase = createClient();

  const { data, isLoading, error } = useSWR(
    'my-bands',
    async () => {
      const { data, error } = await supabase.rpc('get_my_bands');
      if (error) throw error;
      return data as BandsComposite[];
    },
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  return { data, isLoading, error };
}
