'use client';

import Card from '@/components/design/Card';
import Loading from '@/components/design/Loading';
import useBandMembers from '@/hooks/useBandMembers';
import { BandRouteProps } from '../types';
import ResponsiveGrid from '@/components/design/ResponsiveGrid';
import { useMemo } from 'react';
import useUserProfiles from '@/hooks/useUserProfiles';

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

  const responsiveGridItems = useMemo(
    () =>
      bandMembers?.map(({ user_id }) => {
        const bandMemberUserProfile = userProfiles?.find(
          (userProfile) => userProfile.user_id === user_id
        );
        const bandMemberName = [bandMemberUserProfile?.first_name, bandMemberUserProfile?.last_name]
          .filter(Boolean)
          .join(' ');

        return {
          key: user_id,
          content: (
            <Card key={user_id} title={bandMemberName} description={bandMemberUserProfile?.bio} />
          ),
        };
      }),
    [bandMembers, userProfiles]
  );

  const isLoading = useMemo(
    () => isLoadingBandMembers || isLoadingUserProfiles,
    [isLoadingBandMembers, isLoadingUserProfiles]
  );

  if (isLoading) {
    return <Loading />;
  }

  if (responsiveGridItems) {
    return <ResponsiveGrid items={responsiveGridItems} />;
  } else {
    return <>There are no band members</>;
  }
}
