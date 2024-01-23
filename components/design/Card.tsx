import Box from '@mui/material/Box';
import MUICard from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

interface CardProps {
  title?: string | null;
  description?: string | null;
}

export default function Card({ title, description }: Readonly<CardProps>): JSX.Element {
  return (
    <MUICard className="flex m-3 justify-center">
      <CardContent>
        <Box className="flex flex-col">
          {!!title && (
            <Typography component="div" variant="h5">
              <div>{title}</div>
            </Typography>
          )}
          {!!description && (
            <Typography
              variant="subtitle1"
              color="text.secondary"
              component="div"
              className="flex justify-between pt-1"
            >
              {description}
            </Typography>
          )}
        </Box>
      </CardContent>
    </MUICard>
  );
}
