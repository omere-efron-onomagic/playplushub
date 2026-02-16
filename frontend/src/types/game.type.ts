export type GameCategory =
  | 'Puzzle'
  | 'Simulation'
  | 'Adventure'
  | 'Racing'
  | 'Trivia'
  | 'Action';

export type Game = {
  id: string;
  title: string;
  category: GameCategory;
  image: string;
  coinCost: number;
  rewardCoins: number;
  rating: number;
  players: string;
  isHot: boolean;
  isPick: boolean;
  totalRounds?: number;
  levelsPerRound?: number;
};
