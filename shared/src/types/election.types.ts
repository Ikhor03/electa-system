export interface Election {
  id: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Candidate {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
  electionId: number;
  voteCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vote {
  id: number;
  userId: number;
  candidateId: number;
  electionId: number;
  createdAt: Date;
}
