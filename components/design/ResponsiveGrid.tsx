import Grid from '@mui/material/Grid';
import { Fragment } from 'react';

interface ResponsiveGridProps {
  items: {
    key: string;
    content: JSX.Element;
  }[];
}

export default function ResponsiveGrid({ items }: Readonly<ResponsiveGridProps>) {
  return (
    <Grid container spacing={2} justifyContent="flex-start" alignItems="center">
      {items.map(({ key, content }) => (
        <Fragment key={key}>{content}</Fragment>
      ))}
    </Grid>
  );
}
