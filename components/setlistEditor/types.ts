import { Tables } from '@/types/supabase';

interface Setlist {
  title: string;
  date?: Date;
  sets: Set[];
  unusedSongs: Tables<'songs'>[];
}

interface Set {
  songs: Tables<'songs'>[];
}

export { type Setlist, type Set };
