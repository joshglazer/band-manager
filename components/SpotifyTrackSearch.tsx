'use client';

import { formatMsToDuration } from '@/utils/songs';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string; width: number; height: number }>;
  };
  duration_ms: number;
  external_urls: { spotify: string };
}

interface SpotifyTrackSearchProps {
  onSelect: (track: SpotifyTrack) => void;
}

const DEBOUNCE_MS = 500;
const MIN_QUERY_LENGTH = 2;

export default function SpotifyTrackSearch({ onSelect }: Readonly<SpotifyTrackSearchProps>) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < MIN_QUERY_LENGTH) {
      setResults([]);
      setSearched(false);
      setError(undefined);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(undefined);
      setSearched(true);

      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        setResults(await response.json());
      } else if (response.status === 503) {
        setError('Spotify search is not configured.');
      } else {
        setError('Search failed. Please try again.');
      }
      setLoading(false);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div>
      <TextField
        label="Search Spotify"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        fullWidth
        className="mb-2"
        InputProps={{
          endAdornment: loading ? (
            <InputAdornment position="end">
              <CircularProgress size={20} />
            </InputAdornment>
          ) : null,
        }}
      />
      {error && (
        <Typography color="error" variant="body2" className="mb-2">
          {error}
        </Typography>
      )}
      {searched && !loading && results.length === 0 && !error && (
        <Typography variant="body2" color="text.secondary" className="mb-2">
          No results found.
        </Typography>
      )}
      {results.length > 0 && (
        <List
          dense
          sx={{
            maxHeight: 280,
            overflowY: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            mb: 2,
          }}
        >
          {results.map((track) => {
            const thumbnail = track.album.images.at(-1);
            const artistNames = track.artists.map((a) => a.name).join(', ');
            const duration = formatMsToDuration(track.duration_ms);

            return (
              <ListItemButton key={track.id} onClick={() => onSelect(track)} alignItems="flex-start">
                {thumbnail && (
                  <Image
                    src={thumbnail.url}
                    alt={track.album.name}
                    width={40}
                    height={40}
                    style={{ borderRadius: 4, marginRight: 12, flexShrink: 0 }}
                  />
                )}
                <ListItemText
                  primary={track.name}
                  secondary={`${artistNames} · ${duration}`}
                />
              </ListItemButton>
            );
          })}
        </List>
      )}
    </div>
  );
}
