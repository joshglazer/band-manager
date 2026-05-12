ALTER TABLE public.songs
  ADD COLUMN IF NOT EXISTS song_link text;
