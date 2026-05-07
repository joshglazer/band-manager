'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
  children: ReactNode;
}

export default function AuthCard({
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkHref,
  children,
}: AuthCardProps) {
  return (
    <Card sx={{ width: '100%', maxWidth: 420 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} mb={0.5}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          {subtitle}
        </Typography>
        {children}
        <Typography variant="body2" color="text.secondary" mt={3}>
          {footerText}{' '}
          <Link component={NextLink} href={footerLinkHref} underline="hover" color="primary">
            {footerLinkText}
          </Link>
        </Typography>
      </CardContent>
    </Card>
  );
}
