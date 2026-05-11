ALTER TABLE public.songs
  ADD COLUMN IF NOT EXISTS spotify_url text;
