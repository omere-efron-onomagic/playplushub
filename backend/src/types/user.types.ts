export type CreateUserBody = {
  email: string;
  name: string;
};

export type GuestRecord = {
  id: string;
  coins: number;
  createdAt: string;
  updatedAt: string;
  migratedTo: string | null;
  signupPromptCount: number;
  signupRequired: boolean;
};

export type PublicGuest = {
  id: string;
  coins: number;
  signupPromptCount: number;
  signupRequired: boolean;
};

export type MigrationStatus = 'applied' | 'noop' | 'not_found' | 'invalid_token';

export type MigrationResult = {
  status: MigrationStatus;
  coinsTransferred: number;
};
