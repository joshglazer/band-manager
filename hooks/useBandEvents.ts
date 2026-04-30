'use client';

import { BandEvent } from '@/types/composites';
import { createClient } from '@/utils/supabase/client';
import { useState, useEffect, useCallback } from 'react';

interface UseBandEventsProps {
  bandId: number;
}

interface UseBandEventsResult {
  data: BandEvent[] | null;
  isLoading: boolean;
  error: string | null;
  mutate: () => void;
}

export default function useBandEvents({ bandId }: UseBandEventsProps): UseBandEventsResult {
  const [data, setData] = useState<BandEvent[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const supabase = createClient();
    const { data: events, error: fetchError } = await supabase
      .from('band_events')
      .select('*')
      .eq('band_id', bandId)
      .order('date', { ascending: true })
      .order('time', { ascending: true, nullsFirst: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setData(events as BandEvent[]);
    }
    setIsLoading(false);
  }, [bandId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { data, isLoading, error, mutate: fetchEvents };
}
