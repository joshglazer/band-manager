import { Tables } from './supabase';

export interface SetlistComposite extends Tables<'setlists'> {
  setlist_songs: Tables<'setlist_songs'>[];
}
