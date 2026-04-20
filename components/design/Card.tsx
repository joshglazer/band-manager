import Box from '@mui/material/Box';
import MUICard from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
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
  const content = (
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {(!!title || !!icon) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {!!icon && (
              <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', fontSize: 28 }}>
                {icon}
              </Box>
            )}
            {!!title && (
              <Typography component="div" variant="h6" fontWeight={600}>
                {title}
              </Typography>
            )}
          </Box>
        )}
        {!!description && (
          <Typography variant="body2" color="text.secondary" component="div">
            {description}
          </Typography>
        )}
      </Box>
    </CardContent>
  );

  let cardElement = (
    <MUICard sx={{ m: 1.5 }}>
      {link ? (
        <CardActionArea component={Link} href={link}>
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </MUICard>
  );

  if (className) {
    cardElement = <Box className={className}>{cardElement}</Box>;
  }

  return cardElement;
}

export type { CardProps };
