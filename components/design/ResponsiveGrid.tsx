import Grid from '@mui/material/Grid';

interface ResponsiveGridProps {
  items: {
    key: string;
    content: JSX.Element;
  }[];
}

export default function ResponsiveGrid({ items }: Readonly<ResponsiveGridProps>) {
  return (
    <Grid container spacing={2} justifyContent="flex-start" alignItems="stretch" sx={{ mt: 0, ml: 0, width: '100%' }}>
      {items.map(({ key, content }) => (
        <Grid key={key} item xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
          {content}
        </Grid>
      ))}
    </Grid>
  );
}
