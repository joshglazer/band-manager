'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React from 'react';

interface SharesBandNotesViewerProps {
  sharesBandNotes: string;
}

const CHORD_RE = /^[A-G][b#]?(maj|min|m|dim|aug|sus[24]?|add)?[0-9]*(\/[A-G][b#]?)?$/;

function isChordToken(token: string): boolean {
  return CHORD_RE.test(token);
}

function isChordLine(line: string): boolean {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;
  return tokens.filter(isChordToken).length / tokens.length >= 0.6;
}

function renderChordLine(line: string, key: number): React.ReactNode {
  const elements: React.ReactNode[] = [];
  let lastIdx = 0;
  const re = /\S+/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(line)) !== null) {
    if (m.index > lastIdx) {
      elements.push(line.slice(lastIdx, m.index));
    }
    if (isChordToken(m[0])) {
      elements.push(
        <Box component="span" key={m.index} sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          {m[0]}
        </Box>
      );
    } else {
      elements.push(m[0]);
    }
    lastIdx = m.index + m[0].length;
  }

  if (lastIdx < line.length) {
    elements.push(line.slice(lastIdx));
  }

  return <div key={key}>{elements}</div>;
}

export default function SharesBandNotesViewer({ sharesBandNotes }: Readonly<SharesBandNotesViewerProps>) {
  if (!sharesBandNotes.trim()) {
    return (
      <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
        No shares band notes yet.
      </Typography>
    );
  }

  const lines = sharesBandNotes.split('\n');

  return (
    <Box
      sx={{
        fontFamily: 'monospace',
        fontSize: '0.95rem',
        lineHeight: 1.8,
        whiteSpace: 'pre-wrap',
      }}
    >
      {lines.map((line, i) => {
        if (!line.trim()) {
          return <div key={i}>&nbsp;</div>;
        }
        if (isChordLine(line)) {
          return renderChordLine(line, i);
        }
        return <div key={i}>{line}</div>;
      })}
    </Box>
  );
}
