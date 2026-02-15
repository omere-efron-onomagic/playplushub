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
};

export type PublicGuest = {
  id: string;
  coins: number;
};

export type MigrationStatus = 'applied' | 'noop' | 'not_found' | 'invalid_token';

export type MigrationResult = {
  status: MigrationStatus;
  coinsTransferred: number;
};
