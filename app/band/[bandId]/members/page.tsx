'use client';

import Card from '@/components/design/Card';
import Loading from '@/components/design/Loading';
import ResponsiveGrid from '@/components/design/ResponsiveGrid';
import InviteMemberForm from '@/components/forms/InviteMemberForm';
import useBandMemberEmails from '@/hooks/useBandMemberEmails';
import useBandMembers from '@/hooks/useBandMembers';
import useUserProfiles from '@/hooks/useUserProfiles';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import { BandRouteProps } from '../types';

export default function BandMembersPage({ params }: Readonly<BandRouteProps>): JSX.Element {
  const { bandId } = params;

  const { data: bandMembers, isLoading: isLoadingBandMembers } = useBandMembers({ bandId });

  const bandMemberUserIds = useMemo(
    () => bandMembers?.map(({ user_id }) => user_id),
    [bandMembers]
  );

  const { data: userProfiles, isLoading: isLoadingUserProfiles } = useUserProfiles({
    userIds: bandMemberUserIds ?? [],
  });

  const { data: bandMemberEmails, isLoading: isLoadingBandMemberEmails } = useBandMemberEmails({
    bandId,
  });

  const responsiveGridItems = useMemo(
    () =>
      bandMembers?.map(({ user_id }) => {
        const bandMemberUserProfile = userProfiles?.find(
          (userProfile) => userProfile.user_id === user_id
        );
        const profileName = [bandMemberUserProfile?.first_name, bandMemberUserProfile?.last_name]
          .filter(Boolean)
          .join(' ');
        const fallbackEmail = bandMemberEmails?.find((m) => m.user_id === user_id)?.email ?? '';
        const bandMemberName = profileName || fallbackEmail;

        return {
          key: user_id,
          content: (
            <Card key={user_id} title={bandMemberName} description={bandMemberUserProfile?.bio} />
          ),
        };
      }),
    [bandMembers, userProfiles, bandMemberEmails]
  );

  const isLoading = useMemo(
    () => isLoadingBandMembers || isLoadingUserProfiles || isLoadingBandMemberEmails,
    [isLoadingBandMembers, isLoadingUserProfiles, isLoadingBandMemberEmails]
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      {responsiveGridItems?.length ? (
        <ResponsiveGrid items={responsiveGridItems} />
      ) : (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          There are no band members yet.
        </Typography>
      )}

      <Divider sx={{ my: 3 }} />

      <Box sx={{ maxWidth: 480 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <PersonAddIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Invite a Member
          </Typography>
        </Box>
        <InviteMemberForm bandId={bandId} />
      </Box>
    </>
  );
}
