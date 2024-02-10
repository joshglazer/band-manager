import Box from '@mui/material/Box';
import MUICard from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

interface CardProps {
  icon?: JSX.Element;
  title?: string | null;
  description?: string | JSX.Element | null;
  link?: string;
  className?: string;
}

export default function Card({
  title,
  description,
  icon,
  link,
  className,
}: Readonly<CardProps>): JSX.Element {
  let cardElement = (
    <MUICard className="flex m-3 justify-center">
      <CardContent>
        <Box className="flex flex-col">
          {(!!title || !!icon) && (
            <Typography component="div" variant="h5">
              {!!icon && icon} {!!title && title}
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

  if (link) {
    cardElement = (
      <Link href={link} key={link} className="no-underline">
        {cardElement}
      </Link>
    );
  }

  if (className) {
    cardElement = <Box className={className}>{cardElement}</Box>;
  }

  return cardElement;
}

export type { CardProps };
