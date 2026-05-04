import { DroppableStateSnapshot } from 'react-beautiful-dnd';
import { Set, Setlist } from './types';
import { Tables } from '@/types/supabase';
import { BandEvent, SetlistComposite } from '@/types/composites';

export function getDragDropBackgroundColorClassName(snapshot: DroppableStateSnapshot): string {
  return snapshot.isDraggingOver ? 'bg-slate-300' : 'bg-white';
}

export function getEventDisplayName(event: BandEvent): string {
  const type = event.type === 'gig' ? 'Gig' : 'Practice';
  const [year, month, day] = event.date.split('-');
  return `${type} — ${event.location} (${month}/${day}/${year})`;
}

export function getSetlistDisplayName(setlist: {
  name?: string | null;
  event?: BandEvent | null;
  band_events?: BandEvent | null;
}): string {
  if (setlist.name) return setlist.name;
  const event = setlist.event ?? setlist.band_events;
  if (event) return getEventDisplayName(event);
  return 'Untitled Setlist';
}

export function adaptSetlist(setlist: SetlistComposite, songs: Tables<'songs'>[]): Setlist {
  const { id, name, event_id, band_events, setlist_songs, band_id } = setlist;

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
        chord_chart: null,
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
    name: name ?? undefined,
    eventId: event_id ?? undefined,
    event: band_events,
    sets,
    unusedSongs: unusedSongs,
  };
}
