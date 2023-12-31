import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useMemo } from 'react';
import { BandRouteProps } from './types';

export default function BandDashboardPage({
  params,
}: Readonly<BandRouteProps>) {
  const { bandId } = params;

  const actions = useMemo(
    () => [
      {
        title: 'Manage Songs',
        description: 'What songs do you play?',
        link: `/band/${bandId}/songs`,
      },
    ],
    [bandId]
  );

  return (
    <Grid container spacing={2} justifyContent="flex-start" alignItems="center">
      {actions.map(({ title, description, link }) => (
        <Link
          href={link}
          key={link}
          className="no-underline md:basis-1/3 sm:basis-1/2 basis-full"
        >
          <Card className="flex m-3 justify-center">
            <CardContent>
              <Box className="flex flex-col">
                <Typography component="div" variant="h5">
                  <div>{title}</div>
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  component="div"
                  className="flex justify-between pt-1"
                >
                  {description}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Link>
      ))}
    </Grid>
  );
}
