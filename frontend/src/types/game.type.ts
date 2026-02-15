export type GameCategory =
  | 'Puzzle'
  | 'Simulation'
  | 'Adventure'
  | 'Racing'
  | 'Trivia'
  | 'Action';

export type BadgeType = 'hot' | 'pick' | null;

export type Game = {
  id: string;
  title: string;
  category: GameCategory;
  image: string;
  coinCost: number;
  rating: number;
  players: string;
  badge: BadgeType;
};
