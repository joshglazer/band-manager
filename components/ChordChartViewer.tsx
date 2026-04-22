'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';

interface ChordChartViewerProps {
  chordChart: string;
}

export default function ChordChartViewer({ chordChart }: Readonly<ChordChartViewerProps>) {
  const html = useMemo(() => {
    if (!chordChart.trim()) return null;
    try {
      const ChordSheetJS = require('chordsheetjs');
      const parser = new ChordSheetJS.ChordsOverWordsParser();
      const formatter = new ChordSheetJS.HtmlDivFormatter();
      const song = parser.parse(chordChart);
      return formatter.format(song);
    } catch {
      return null;
    }
  }, [chordChart]);

  if (!html) {
    return (
      <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
        No chord chart yet.
      </Typography>
    );
  }

  return (
    <Box
      dangerouslySetInnerHTML={{ __html: html }}
      sx={{
        fontFamily: 'monospace',
        fontSize: '0.95rem',
        lineHeight: 1.6,
        '& .chord': {
          color: 'primary.main',
          fontWeight: 'bold',
          display: 'block',
        },
        '& .lyrics': {
          display: 'block',
        },
        '& .column': {
          display: 'inline-flex',
          flexDirection: 'column',
          marginRight: 1.5,
          verticalAlign: 'top',
        },
        '& .row': {
          display: 'flex',
          flexWrap: 'wrap',
          marginBottom: 0.5,
        },
        '& .paragraph': {
          marginBottom: 3,
        },
      }}
    />
  );
}
