
export type BetStatus = 'OPEN' | 'VOTING' | 'DISPUTED' | 'RESOLVED';

export interface Participant {
  lnAddress: string;
  selectedOutcome: string;
  contribution: number; // in satoshis
  votedOutcome?: string;
  isReferee?: boolean;
}

export interface Bet {
  id: string;
  initiator: string;
  eventName: string;
  eventDescription: string;
  winningOutcomes: string[];
  losingOutcomes: string[];
  betAmount: number;
  deadline: string;
  status: BetStatus;
  participants: Participant[];
  finalOutcome?: string;
  createdAt: string;
}

export interface UserSession {
  lnAddress: string;
}
