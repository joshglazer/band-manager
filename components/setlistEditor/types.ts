import { Tables } from '@/types/supabase';
import { BandEvent } from '@/types/composites';

interface Setlist {
  id?: number;
  bandId: number;
  name?: string;
  eventId?: number;
  event?: BandEvent | null;
  sets: Set[];
  unusedSongs: Tables<'songs'>[];
}

interface Set {
  songs: Tables<'songs'>[];
}

export { type Setlist, type Set };
