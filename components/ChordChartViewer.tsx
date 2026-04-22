'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

interface ChordChartViewerProps {
  chordChart: string;
}

export default function ChordChartViewer({ chordChart }: Readonly<ChordChartViewerProps>) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    if (!chordChart.trim()) {
      setHtml(null);
      return;
    }
    try {
      const { ChordsOverWordsParser, HtmlDivFormatter } = require('chordsheetjs');
      const parser = new ChordsOverWordsParser();
      const formatter = new HtmlDivFormatter();
      const song = parser.parse(chordChart);
      setHtml(formatter.format(song));
    } catch (e) {
      console.error('ChordSheetJS parse error:', e);
      setHtml(null);
    }
  }, [chordChart]);

  if (!chordChart.trim()) {
    return (
      <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
        No chord chart yet.
      </Typography>
    );
  }

  if (!html) {
    return (
      <Box
        component="pre"
        sx={{
          fontFamily: 'monospace',
          fontSize: '0.95rem',
          lineHeight: 1.6,
          whiteSpace: 'pre',
          overflowX: 'auto',
          m: 0,
        }}
      >
        {chordChart}
      </Box>
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
