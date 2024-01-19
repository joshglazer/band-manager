import { DroppableStateSnapshot } from 'react-beautiful-dnd';
import { Set, Setlist } from './types';
import { Tables } from '@/types/supabase';
import { SetlistComposite } from '@/types/composites';

export function getDragDropBackgroundColorClassName(snapshot: DroppableStateSnapshot): string {
  return snapshot.isDraggingOver ? 'bg-slate-300' : 'bg-white';
}

export function adaptSetlist(setlist: SetlistComposite, songs: Tables<'songs'>[]): Setlist {
  const { id, name, setlist_songs, band_id } = setlist;

  const sets: Set[] = [];

  const usedSongIds: number[] = [];

  setlist_songs.sort((a, b) => {
    if (a.set !== b.set) {
      return a.set - b.set;
    }
    return a.set_weight - b.set_weight;
  });

  setlist_songs.forEach(({ set, song_id }) => {
    let song = songs.find(({ id }) => id === song_id);
    if (!song) {
      song = {
        band_id,
        duration: 0,
        id: -1,
        name: 'Not Found',
        artist: 'Not Found',
        created_at: 'Not Found',
      };
    } else {
      usedSongIds.push(song.id);
    }
    if (set === sets.length) {
      sets.push({
        songs: [song],
      });
    } else {
      sets[sets.length - 1].songs.push(song);
    }
  });

  const unusedSongs = songs.filter(({ id }) => !usedSongIds.includes(id));

  return {
    id,
    bandId: band_id,
    name: name ?? '',
    sets,
    unusedSongs: unusedSongs,
  };
}
