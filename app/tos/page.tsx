import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';

export const metadata = {
  title: 'Terms of Service | Band Manager',
};

export default function TermsOfServicePage() {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Terms of Service
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
        Last updated: May 2025
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        1. Acceptance of Terms
      </Typography>
      <Typography variant="body1" paragraph>
        By using Band Manager, you agree to these Terms of Service. If you do not agree, please do
        not use the application.
      </Typography>

      <Typography variant="h6" gutterBottom>
        2. User-Generated Content
      </Typography>
      <Typography variant="body1" paragraph>
        Band Manager allows you to store notes, lyrics, chord charts, and other content associated
        with your band&apos;s songs (&quot;User Content&quot;). You are solely responsible for all
        User Content you upload, enter, or store in the application.
      </Typography>
      <Typography variant="body1" paragraph>
        By submitting User Content, you represent and warrant that:
      </Typography>
      <Box component="ul" sx={{ pl: 4, mb: 2 }}>
        <Typography component="li" variant="body1" gutterBottom>
          You own the content, or you have the legal right to use and store it.
        </Typography>
        <Typography component="li" variant="body1" gutterBottom>
          Your content does not infringe the copyrights, trademarks, or other intellectual property
          rights of any third party.
        </Typography>
        <Typography component="li" variant="body1" gutterBottom>
          You have obtained any necessary permissions or licenses from copyright holders before
          storing copyrighted material.
        </Typography>
      </Box>
      <Typography variant="body1" paragraph>
        We do not review, verify, or endorse User Content. You bear full responsibility for ensuring
        your use of any third-party material complies with applicable law.
      </Typography>

      <Typography variant="h6" gutterBottom>
        3. Copyright and Intellectual Property
      </Typography>
      <Typography variant="body1" paragraph>
        Band Manager respects intellectual property rights. We comply with the Digital Millennium
        Copyright Act (DMCA) and will respond to valid takedown notices. If you believe content in
        the application infringes your copyright, please review our{' '}
        <Link href="/dmca" underline="hover">
          DMCA Policy
        </Link>
        .
      </Typography>
      <Typography variant="body1" paragraph>
        As a general guide:
      </Typography>
      <Box component="ul" sx={{ pl: 4, mb: 2 }}>
        <Typography component="li" variant="body1" gutterBottom>
          Personal notes and original content you wrote — generally safe to store.
        </Typography>
        <Typography component="li" variant="body1" gutterBottom>
          Chord progressions you worked out yourself — generally safe to store.
        </Typography>
        <Typography component="li" variant="body1" gutterBottom>
          Lyrics, tabs, or transcriptions copied from other sources — may be protected by copyright;
          ensure you have the right to use them.
        </Typography>
      </Box>

      <Typography variant="h6" gutterBottom>
        4. Privacy of Your Content
      </Typography>
      <Typography variant="body1" paragraph>
        Your band&apos;s content is private and accessible only to members of your band. We do not
        publish, index, or share your User Content with other users or the public.
      </Typography>

      <Typography variant="h6" gutterBottom>
        5. Prohibited Uses
      </Typography>
      <Typography variant="body1" paragraph>
        You agree not to use Band Manager to:
      </Typography>
      <Box component="ul" sx={{ pl: 4, mb: 2 }}>
        <Typography component="li" variant="body1" gutterBottom>
          Store or distribute content that infringes third-party intellectual property rights.
        </Typography>
        <Typography component="li" variant="body1" gutterBottom>
          Violate any applicable law or regulation.
        </Typography>
        <Typography component="li" variant="body1" gutterBottom>
          Attempt to gain unauthorized access to other users&apos; data.
        </Typography>
      </Box>

      <Typography variant="h6" gutterBottom>
        6. Disclaimer of Warranties
      </Typography>
      <Typography variant="body1" paragraph>
        Band Manager is provided &quot;as is&quot; without warranties of any kind. We make no
        guarantees about uptime, data retention, or fitness for a particular purpose.
      </Typography>

      <Typography variant="h6" gutterBottom>
        7. Limitation of Liability
      </Typography>
      <Typography variant="body1" paragraph>
        To the maximum extent permitted by law, we are not liable for any indirect, incidental,
        special, or consequential damages arising from your use of Band Manager.
      </Typography>

      <Typography variant="h6" gutterBottom>
        8. Changes to These Terms
      </Typography>
      <Typography variant="body1" paragraph>
        We may update these Terms from time to time. Continued use of Band Manager after changes
        are posted constitutes your acceptance of the revised Terms.
      </Typography>

      <Typography variant="h6" gutterBottom>
        9. Contact
      </Typography>
      <Typography variant="body1" paragraph>
        Questions about these Terms? Contact us at{' '}
        <Link href="https://joshglazer.com" target="_blank" rel="noreferrer" underline="hover">
          joshglazer.com
        </Link>
        .
      </Typography>
    </Box>
  );
}
