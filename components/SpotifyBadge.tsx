import Chip from '@mui/material/Chip';

interface SpotifyBadgeProps {
  spotifyUrl: string;
}

export default function SpotifyBadge({ spotifyUrl }: Readonly<SpotifyBadgeProps>) {
  return (
    <Chip
      component="a"
      href={spotifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      label="Spotify"
      size="small"
      clickable
      sx={{
        backgroundColor: '#1DB954',
        color: '#fff',
        fontWeight: 700,
        fontSize: '0.65rem',
        letterSpacing: '0.04em',
        '&:hover': { backgroundColor: '#17a349' },
      }}
    />
  );
}
