'use client';

import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import { PostgrestError, useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { useMemo } from 'react';

interface UsCommentTypesResult {
  data?: Tables<'comment_types'>[] | null;
  isLoading: boolean;
  error?: PostgrestError;
}

export default function useCommentTypes(): UsCommentTypesResult {
  const supabase = createClient();

  const query = useMemo(() => supabase.from('comment_types').select('*'), [supabase]);

  const { data, isLoading, error } = useQuery<Tables<'comment_types'>[]>(query, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return { data, isLoading, error };
}
