import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

interface BlockHeaderProps {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}

export default function BlockHeader({ icon, title, action }: BlockHeaderProps) {
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        {icon}
        <Typography variant="subtitle1" fontWeight={700} lineHeight={1} sx={{ flex: 1 }}>
          {title}
        </Typography>
        {action}
      </Box>
      <Divider sx={{ mb: 2 }} />
    </>
  );
}

export type { BlockHeaderProps };
