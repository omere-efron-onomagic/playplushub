export type User = {
  id: string;
  name: string;
  email: string | null;
  coins: number;
  token: string | null;
  guestToken: string | null;
  isGuest: boolean;
};
