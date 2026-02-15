import type { Game } from '@/types/game.type';

export const games: Game[] = [
  {
    id: '1',
    title: '4 Pics 1 Word',
    category: 'Puzzle',
    image: 'https://placehold.co/400x300/E84393/ffffff?font=montserrat&text=4+PICS%0A1+WORD',
    coinCost: 2,
    rewardCoins: 20,
    rating: 4.5,
    players: '12.3K',
    isHot: true,
    isPick: false
  },
  {
    id: '2',
    title: 'Cooking Panic!',
    category: 'Simulation',
    image: 'https://placehold.co/400x300/E17055/ffffff?font=montserrat&text=%F0%9F%8D%B3%0ACOOKING%0APANIC',
    coinCost: 3,
    rewardCoins: 30,
    rating: 4.8,
    players: '8.7K',
    isHot: false,
    isPick: true
  },
  {
    id: '3',
    title: 'Mystery Box',
    category: 'Adventure',
    image: 'https://placehold.co/400x300/B8860B/ffffff?font=montserrat&text=%F0%9F%93%A6%0AMYSTERY%0ABOX',
    coinCost: 5,
    rewardCoins: 50,
    rating: 4.2,
    players: '15.1K',
    isHot: true,
    isPick: false
  },
  {
    id: '4',
    title: 'Memory Flash',
    category: 'Puzzle',
    image: 'https://placehold.co/400x300/6C5CE7/ffffff?font=montserrat&text=%F0%9F%83%8F%0AMEMORY%0AFLASH',
    coinCost: 1,
    rewardCoins: 10,
    rating: 4.0,
    players: '5.2K',
    isHot: false,
    isPick: false
  },
  {
    id: '5',
    title: 'Neon Racer',
    category: 'Racing',
    image: 'https://placehold.co/400x300/0984E3/ffffff?font=montserrat&text=%F0%9F%8F%8E%0ANEON%0ARACER',
    coinCost: 4,
    rewardCoins: 40,
    rating: 4.5,
    players: '22.5K',
    isHot: true,
    isPick: true
  },
  {
    id: '6',
    title: 'Brain Trivia',
    category: 'Trivia',
    image: 'https://placehold.co/400x300/FD79A8/333333?font=montserrat&text=%F0%9F%A7%A0%0ABRAIN%0ATRIVIA',
    coinCost: 2,
    rewardCoins: 20,
    rating: 4.3,
    players: '9.8K',
    isHot: false,
    isPick: false
  },
  {
    id: '7',
    title: 'Arena Clash',
    category: 'Action',
    image: 'https://placehold.co/400x300/D63031/ffffff?font=montserrat&text=%E2%9A%94%0AARENA%0ACLASH',
    coinCost: 3,
    rewardCoins: 30,
    rating: 4.7,
    players: '18.6K',
    isHot: false,
    isPick: true
  },
  {
    id: '8',
    title: 'Word Wizard',
    category: 'Puzzle',
    image: 'https://placehold.co/400x300/00CEC9/333333?font=montserrat&text=%F0%9F%94%A4%0AWORD%0AWIZARD',
    coinCost: 2,
    rewardCoins: 20,
    rating: 4.1,
    players: '6.4K',
    isHot: false,
    isPick: false
  },
  {
    id: '9',
    title: 'Space Drift',
    category: 'Racing',
    image: 'https://placehold.co/400x300/2D3436/ffffff?font=montserrat&text=%F0%9F%9A%80%0ASPACE%0ADRIFT',
    coinCost: 5,
    rewardCoins: 50,
    rating: 4.6,
    players: '14.2K',
    isHot: true,
    isPick: false
  },
  {
    id: '10',
    title: 'Farm Builder',
    category: 'Simulation',
    image: 'https://placehold.co/400x300/00B894/ffffff?font=montserrat&text=%F0%9F%8C%BE%0AFARM%0ABUILDER',
    coinCost: 3,
    rewardCoins: 30,
    rating: 4.4,
    players: '11.8K',
    isHot: false,
    isPick: true
  },
  {
    id: '11',
    title: 'Dungeon Quest',
    category: 'Adventure',
    image: 'https://placehold.co/400x300/636E72/ffffff?font=montserrat&text=%F0%9F%97%A1%0ADUNGEON%0AQUEST',
    coinCost: 4,
    rewardCoins: 40,
    rating: 4.3,
    players: '9.1K',
    isHot: false,
    isPick: false
  },
  {
    id: '12',
    title: 'Quiz Master',
    category: 'Trivia',
    image: 'https://placehold.co/400x300/FDCB6E/333333?font=montserrat&text=%E2%9D%93%0AQUIZ%0AMASTER',
    coinCost: 1,
    rewardCoins: 10,
    rating: 4.0,
    players: '7.5K',
    isHot: false,
    isPick: false
  }
];

export const categories = [
  'All',
  'Puzzle',
  'Simulation',
  'Adventure',
  'Racing',
  'Trivia',
  'Action'
] as const;
