'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { ReactNode } from 'react';

export default function AuthCard({ children }: { children: ReactNode }) {
  return (
    <Card sx={{ width: '100%', maxWidth: 420 }}>
      <CardContent sx={{ p: 4 }}>{children}</CardContent>
    </Card>
  );
}
