import { Tables } from './supabase';

export interface VoteProposalWithBallots extends Tables<'vote_proposals'> {
  vote_ballots: Tables<'vote_ballots'>[];
  user_profiles: { first_name: string | null; last_name: string | null } | null;
}

export interface VoteSessionWithDetails extends Tables<'vote_sessions'> {
  vote_proposals: VoteProposalWithBallots[];
}

export interface SetlistComposite extends Tables<'setlists'> {
  setlist_songs: Tables<'setlist_songs'>[];
  band_events: BandEvent | null;
}

export type EventType = 'practice' | 'gig';

export interface BandEvent {
  id: number;
  band_id: number;
  type: EventType;
  location: string;
  date: string;
  time: string | null;
  created_at: string;
}
