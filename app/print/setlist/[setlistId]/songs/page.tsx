'use client';

import Loading from '@/components/design/Loading';
import { getSetlistDisplayName } from '@/components/setlistEditor/helpers';
import useSetlistWithSongs from '@/hooks/useSetlistWithSongs';
import { Tables } from '@/types/supabase';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PrintIcon from '@mui/icons-material/Print';
import { useMemo } from 'react';

interface PrintSetlistPageProps {
  params: { setlistId: number };
}

interface SetSongs {
  setNumber: number;
  songs: Tables<'songs'>[];
}

export default function PrintSetlistPage({ params }: Readonly<PrintSetlistPageProps>) {
  const { setlistId } = params;
  const { data: setlist, isLoading } = useSetlistWithSongs({ setlistId });

  const sets = useMemo<SetSongs[]>(() => {
    if (!setlist) return [];
    const sorted = [...setlist.setlist_songs].sort((a, b) => {
      if (a.set !== b.set) return (a.set ?? 0) - (b.set ?? 0);
      return (a.set_weight ?? 0) - (b.set_weight ?? 0);
    });
    const setMap = new Map<number, Tables<'songs'>[]>();
    sorted.forEach((ss) => {
      const setNum = ss.set ?? 0;
      if (!setMap.has(setNum)) setMap.set(setNum, []);
      setMap.get(setNum)!.push(ss.songs);
    });
    return Array.from(setMap.entries()).map(([setNumber, songs]) => ({ setNumber, songs }));
  }, [setlist]);

  if (isLoading) return <Loading />;
  if (!setlist) return <Typography variant="h5">Setlist not found.</Typography>;

  return (
    <>
      <style>{`
        header, footer { display: none !important; }
        main { padding-top: 0 !important; }
        @media print {
          .no-print { display: none !important; }
          header, footer { display: none !important; }
        }
        @media print {
          .sets-grid {
            columns: 2;
            column-gap: 2rem;
          }
          .set-block {
            break-inside: avoid;
          }
        }
      `}</style>

      <Box className="no-print" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          {getSetlistDisplayName(setlist)} — Setlist
        </Typography>
        <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>
          Print
        </Button>
      </Box>

      {sets.length === 0 ? (
        <Typography color="text.secondary">No songs in this setlist.</Typography>
      ) : (
        <Box
          className="sets-grid"
          sx={{
            display: 'grid',
            gridTemplateColumns: sets.length > 1 ? { xs: '1fr', sm: 'repeat(2, 1fr)' } : '1fr',
            gap: 3,
          }}
        >
          {sets.map(({ setNumber, songs }) => (
            <Box key={setNumber} className="set-block">
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5, borderBottom: '1px solid', borderColor: 'divider', pb: 0.5 }}>
                Set {setNumber + 1}
              </Typography>
              {songs.map((song, i) => (
                <Box key={song.id} sx={{ py: 0.25 }}>
                  <Typography variant="body2" fontWeight={500} component="div">
                    {i + 1}. {song.name}
                  </Typography>
                  {song.artist && (
                    <Typography variant="caption" color="text.secondary" component="div" sx={{ pl: 1.5 }}>
                      {song.artist}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      )}
    </>
  );
}
