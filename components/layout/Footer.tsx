import GitHubIcon from '@mui/icons-material/GitHub';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        borderTop: '1px solid',
        borderColor: 'divider',
        minHeight: 64,
        py: 1,
      }}
    >
      <div className="w-full flex flex-wrap justify-between items-center gap-2 px-3">
        <Typography variant="caption" color="text.secondary">
          A{' '}
          <Link href="https://joshglazer.com" target="_blank" rel="noreferrer" underline="hover" color="inherit" fontWeight={600}>
            Josh Glazer
          </Link>{' '}
          Project
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Link href="/tos" underline="hover" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            Terms of Service
          </Link>
          <Link href="/dmca" underline="hover" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            DMCA
          </Link>
          <Link
            href="https://github.com/joshglazer/band-manager"
            target="_blank"
            rel="noreferrer"
            underline="hover"
            color="text.secondary"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem', fontWeight: 600 }}
          >
            <GitHubIcon sx={{ fontSize: 16 }} /> Source Code
          </Link>
        </Box>
      </div>
    </Box>
  );
}
