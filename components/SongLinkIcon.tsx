import { SpotifyIcon } from '@/components/SpotifyBadge';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import { type ReactNode, useRef, useState } from 'react';

function YouTubeIcon({ size }: { size: number }) {
  return (
    <svg role="img" viewBox="0 0 24 24" width={size} height={size} aria-label="YouTube" style={{ flexShrink: 0 }}>
      <path
        fill="#FF0000"
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
      />
    </svg>
  );
}

function SoundCloudIcon({ size }: { size: number }) {
  return (
    <svg role="img" viewBox="0 0 24 24" width={size} height={size} aria-label="SoundCloud" style={{ flexShrink: 0 }}>
      <path
        fill="#FF5500"
        d="M23.999 14.165c-.052 1.796-1.612 3.169-3.4 3.169h-8.18a.68.68 0 0 1-.675-.683V7.862a.747.747 0 0 1 .452-.724s.75-.513 2.333-.513a5.364 5.364 0 0 1 2.763.755 5.433 5.433 0 0 1 2.57 3.54c.282-.08.574-.121.868-.12.884 0 1.73.358 2.347.992s.948 1.49.922 2.373ZM10.721 8.421c.247 2.98.427 5.697 0 8.672a.264.264 0 0 1-.53 0c-.395-2.946-.22-5.718 0-8.672a.264.264 0 0 1 .53 0ZM9.072 9.448c.285 2.659.37 4.986-.006 7.655a.277.277 0 0 1-.55 0c-.331-2.63-.256-5.02 0-7.655a.277.277 0 0 1 .556 0Zm-1.663-.257c.27 2.726.39 5.171 0 7.904a.266.266 0 0 1-.532 0c-.38-2.69-.257-5.21 0-7.904a.266.266 0 0 1 .532 0Zm-1.647.77a26.108 26.108 0 0 1-.008 7.147a.272.272 0 0 1-.542 0a27.955 27.955 0 0 1 0-7.147a.275.275 0 0 1 .55 0Zm-1.67 1.769c.421 1.865.228 3.5-.029 5.388a.257.257 0 0 1-.514 0c-.21-1.858-.398-3.549 0-5.389a.272.272 0 0 1 .543 0Zm-1.655-.273c.388 1.897.26 3.508-.01 5.412-.026.28-.514.283-.54 0-.244-1.878-.347-3.54-.01-5.412a.283.283 0 0 1 .56 0Zm-1.668.911c.4 1.268.257 2.292-.026 3.572a.257.257 0 0 1-.514 0c-.241-1.262-.354-2.312-.023-3.572a.283.283 0 0 1 .563 0Z"
      />
    </svg>
  );
}

function BandcampIcon({ size }: { size: number }) {
  return (
    <svg role="img" viewBox="0 0 24 24" width={size} height={size} aria-label="Bandcamp" style={{ flexShrink: 0 }}>
      <path fill="#1DA0C3" d="M0 18.75l7.437-13.5H24L16.563 18.75z" />
    </svg>
  );
}

function VimeoIcon({ size }: { size: number }) {
  return (
    <svg role="img" viewBox="0 0 24 24" width={size} height={size} aria-label="Vimeo" style={{ flexShrink: 0 }}>
      <path
        fill="#1AB7EA"
        d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.813 3.834 7.519 3.01 7.519c-.179 0-.806.378-1.881 1.132L0 7.197a315.065 315.065 0 0 0 3.881-3.459c1.753-1.519 3.064-2.32 3.934-2.396 2.064-.195 3.334 1.213 3.81 4.22.51 3.237.866 5.247 1.065 6.026.588 2.652 1.235 3.979 1.94 3.979.548 0 1.373-.865 2.474-2.596 1.1-1.73 1.687-3.051 1.763-3.96.157-1.5-.434-2.251-1.763-2.251-.626 0-1.271.144-1.94.433 1.29-4.237 3.745-6.296 7.374-6.176 2.688.086 3.952 1.82 3.439 5.2z"
      />
    </svg>
  );
}

function AppleMusicIcon({ size }: { size: number }) {
  return (
    <svg role="img" viewBox="0 0 24 24" width={size} height={size} aria-label="Apple Music" style={{ flexShrink: 0 }}>
      <path
        fill="#FC3C44"
        d="M23.994 6.124a9.23 9.23 0 0 0-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 0 0-1.877-.726 10.496 10.496 0 0 0-1.564-.15c-.05-.003-.095-.01-.14-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.29 1.44-2.795 2.796-.175.468-.272.954-.317 1.454-.013.15-.02.302-.026.453v11.97c.013.155.02.31.033.462.094 1.02.39 1.966.975 2.8.598.856 1.4 1.47 2.388 1.84.58.22 1.184.33 1.805.37.386.026.773.04 1.16.04h9.31c.34 0 .683-.01 1.022-.045.707-.072 1.39-.24 2.026-.56 1.177-.59 1.987-1.5 2.44-2.748.184-.502.27-1.022.3-1.55.01-.15.01-.3.01-.45V6.124zm-9.646 2.532v5.63c0 .64-.07 1.264-.42 1.823-.43.697-1.07 1.075-1.878 1.133-.152.01-.306.022-.458.01-.76-.056-1.397-.62-1.54-1.367-.15-.8.195-1.592.897-2.003.39-.23.822-.35 1.26-.44.43-.09.863-.17 1.29-.27.24-.057.395-.2.404-.453.007-.157 0-.313 0-.47V6.35c0-.073.01-.147.02-.22.06-.43.386-.67.806-.578.39.086.615.39.62.826.004.43 0 .858 0 1.287v.99z"
      />
    </svg>
  );
}

function TidalIcon({ size }: { size: number }) {
  return (
    <svg role="img" viewBox="0 0 24 24" width={size} height={size} aria-label="Tidal" style={{ flexShrink: 0 }}>
      <path
        fill="#000000"
        d="M12.012 3.992L8.008 7.996 4.004 3.992 0 7.996l4.004 4.004 4.004-4.004 4.004 4.004 4.004-4.004L19.996 11.988l4.004-4.004-4.004-4.004-3.984 3.996zM8.008 11.988l-4.004 4.004L7.988 20l4.004-4.004L8.008 11.988zm7.98 0L11.988 16l4.004 3.984 3.984-3.996-3.988-3.96z"
      />
    </svg>
  );
}

type Platform =
  | 'youtube'
  | 'soundcloud'
  | 'spotify'
  | 'applemusic'
  | 'bandcamp'
  | 'vimeo'
  | 'tidal'
  | 'generic';

function detectPlatform(url: string): Platform {
  try {
    const { hostname } = new URL(url);
    const host = hostname.replace(/^www\./, '');
    if (host === 'youtube.com' || host === 'youtu.be' || host === 'music.youtube.com') return 'youtube';
    if (host === 'soundcloud.com') return 'soundcloud';
    if (host === 'open.spotify.com' || host === 'spotify.com') return 'spotify';
    if (host === 'music.apple.com') return 'applemusic';
    if (host.endsWith('.bandcamp.com') || host === 'bandcamp.com') return 'bandcamp';
    if (host === 'vimeo.com') return 'vimeo';
    if (host === 'tidal.com' || host === 'listen.tidal.com') return 'tidal';
  } catch (_e) {
    // invalid URL
  }
  return 'generic';
}

const platformLabels: Record<Platform, string> = {
  youtube: 'Listen on YouTube',
  soundcloud: 'Listen on SoundCloud',
  spotify: 'Listen on Spotify',
  applemusic: 'Listen on Apple Music',
  bandcamp: 'Listen on Bandcamp',
  vimeo: 'Watch on Vimeo',
  tidal: 'Listen on Tidal',
  generic: 'Open link',
};

interface SongLinkIconProps {
  url: string;
  size?: number;
}

export default function SongLinkIcon({ url, size = 20 }: Readonly<SongLinkIconProps>) {
  const platform = detectPlatform(url);
  const label = platformLabels[platform];
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);

  let icon: ReactNode;
  switch (platform) {
    case 'youtube':
      icon = <YouTubeIcon size={size} />;
      break;
    case 'soundcloud':
      icon = <SoundCloudIcon size={size} />;
      break;
    case 'spotify':
      icon = <SpotifyIcon size={size} />;
      break;
    case 'applemusic':
      icon = <AppleMusicIcon size={size} />;
      break;
    case 'bandcamp':
      icon = <BandcampIcon size={size} />;
      break;
    case 'vimeo':
      icon = <VimeoIcon size={size} />;
      break;
    case 'tidal':
      icon = <TidalIcon size={size} />;
      break;
    default:
      icon = <PlayCircleOutlineIcon sx={{ fontSize: size, color: 'text.secondary' }} />;
  }

  if (platform === 'soundcloud') {
    const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23FF5500&auto_play=true&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
    return (
      <>
        <Tooltip title={label}>
          <span
            ref={anchorRef}
            role="button"
            tabIndex={0}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            onKeyDown={(e) => e.key === 'Enter' && setAnchorEl(anchorRef.current)}
            style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, cursor: 'pointer' }}
            aria-label={label}
          >
            {icon}
          </span>
        </Tooltip>
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <iframe
            width="300"
            height="166"
            allow="autoplay"
            src={embedUrl}
            style={{ border: 'none', display: 'block' }}
            title="SoundCloud player"
          />
        </Popover>
      </>
    );
  }

  return (
    <Tooltip title={label}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
        aria-label={label}
      >
        {icon}
      </a>
    </Tooltip>
  );
}
