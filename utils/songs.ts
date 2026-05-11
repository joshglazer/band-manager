// Strips Spotify remaster suffixes, e.g. " - 2022 Remaster", " - 2019 Remastered Version"
export function cleanSpotifyTrackName(name: string): string {
  return name.replace(/ - \(?\d{4} Remaster(?:ed)?(?:\s+\w+)*\)?$/i, '').trim();
}

export function parseDurationToMs(value: string): number | null {
  const match = value.trim().match(/^(\d+):([0-5]\d)$/);
  if (!match) return null;
  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);
  return (minutes * 60 + seconds) * 1000;
}

export function formatMsToDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
