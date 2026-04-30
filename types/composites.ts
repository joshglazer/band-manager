import { Tables } from './supabase';

export interface SetlistComposite extends Tables<'setlists'> {
  setlist_songs: Tables<'setlist_songs'>[];
}

export type EventType = 'practice' | 'gig';

export interface BandEvent {
  id: number;
  band_id: number;
  type: EventType;
  location: string;
  date: string;
  time: string | null;
  created_at: string;
}
