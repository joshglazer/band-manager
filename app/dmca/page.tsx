import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';

export const metadata = {
  title: 'DMCA Policy | Band Manager',
};

export default function DmcaPage() {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        DMCA Policy
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
        Last updated: May 2025
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Typography variant="body1" paragraph>
        Band Manager respects intellectual property rights and complies with the Digital Millennium
        Copyright Act (DMCA), 17 U.S.C. § 512. If you believe that content stored within our
        application infringes your copyright, you may submit a takedown notice as described below.
      </Typography>

      <Typography variant="h6" gutterBottom>
        How to Submit a Takedown Notice
      </Typography>
      <Typography variant="body1" paragraph>
        To submit a DMCA takedown notice, please provide all of the following in writing:
      </Typography>
      <Box component="ol" sx={{ pl: 4, mb: 2 }}>
        <Typography component="li" variant="body1" gutterBottom>
          <strong>Identification of the copyrighted work</strong> — A description of the
          copyrighted work you claim has been infringed, including any registration number if
          applicable.
        </Typography>
        <Typography component="li" variant="body1" gutterBottom>
          <strong>Identification of the infringing material</strong> — Sufficient information to
          allow us to locate the material within our application (e.g., the song name, band name,
          and a description of the content).
        </Typography>
        <Typography component="li" variant="body1" gutterBottom>
          <strong>Your contact information</strong> — Your name, address, telephone number, and
          email address.
        </Typography>
        <Typography component="li" variant="body1" gutterBottom>
          <strong>Good faith statement</strong> — A statement that you have a good faith belief
          that the use of the material is not authorized by the copyright owner, its agent, or
          the law.
        </Typography>
        <Typography component="li" variant="body1" gutterBottom>
          <strong>Accuracy statement</strong> — A statement, under penalty of perjury, that the
          information in your notice is accurate and that you are the copyright owner or authorized
          to act on the copyright owner&apos;s behalf.
        </Typography>
        <Typography component="li" variant="body1" gutterBottom>
          <strong>Signature</strong> — Your physical or electronic signature.
        </Typography>
      </Box>

      <Typography variant="h6" gutterBottom>
        Where to Send Notices
      </Typography>
      <Typography variant="body1" paragraph>
        Send completed takedown notices to our designated DMCA agent via the contact form at{' '}
        <Link href="https://joshglazer.com" target="_blank" rel="noreferrer" underline="hover">
          joshglazer.com
        </Link>
        . Please include &quot;DMCA Takedown Notice&quot; in the subject line.
      </Typography>

      <Typography variant="h6" gutterBottom>
        Our Response
      </Typography>
      <Typography variant="body1" paragraph>
        Upon receipt of a valid takedown notice, we will:
      </Typography>
      <Box component="ul" sx={{ pl: 4, mb: 2 }}>
        <Typography component="li" variant="body1" gutterBottom>
          Promptly review the notice for completeness.
        </Typography>
        <Typography component="li" variant="body1" gutterBottom>
          Remove or disable access to the allegedly infringing content.
        </Typography>
        <Typography component="li" variant="body1" gutterBottom>
          Notify the user who uploaded the content, where required by law.
        </Typography>
      </Box>

      <Typography variant="h6" gutterBottom>
        Counter-Notices
      </Typography>
      <Typography variant="body1" paragraph>
        If you believe your content was removed in error, you may submit a counter-notice. A valid
        counter-notice must include your contact information, identification of the removed content,
        a statement under penalty of perjury that you have a good faith belief the content was
        removed due to mistake or misidentification, and your consent to jurisdiction of the federal
        court in your district.
      </Typography>

      <Typography variant="h6" gutterBottom>
        Repeat Infringers
      </Typography>
      <Typography variant="body1" paragraph>
        In appropriate circumstances, we will terminate the accounts of users who are repeat
        infringers.
      </Typography>

      <Typography variant="h6" gutterBottom>
        More Information
      </Typography>
      <Typography variant="body1" paragraph>
        For general questions about acceptable use of content in Band Manager, please review our{' '}
        <Link href="/tos" underline="hover">
          Terms of Service
        </Link>
        .
      </Typography>
    </Box>
  );
}
