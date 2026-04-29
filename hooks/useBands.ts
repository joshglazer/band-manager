'use client';

import { createClient } from '@/utils/supabase/client';
import useSWR from 'swr';

export interface BandsComposite {
  id: number;
  name: string;
  created_at: string;
  archived_at: string | null;
  song_count: number;
  member_count: number;
}

interface UseBandsOptions {
  includeArchived?: boolean;
}

interface UseBandsResult {
  data?: BandsComposite[] | null;
  isLoading: boolean;
  error?: Error;
}

export default function useBands({ includeArchived = false }: UseBandsOptions = {}): UseBandsResult {
  const supabase = createClient();

  const { data, isLoading, error } = useSWR(
    `my-bands-${includeArchived ? 'archived' : 'active'}`,
    async () => {
      const { data, error } = await supabase.rpc('get_my_bands', { archived_only: includeArchived });
      if (error) throw error;
      return data as BandsComposite[];
    },
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  return { data, isLoading, error };
}
