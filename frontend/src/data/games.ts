import type { Game } from '@/types/game.type';

export const games: Game[] = [
  {
    id: '1',
    title: '4 Pics 1 Word',
    category: 'Puzzle',
    image: 'https://placehold.co/400x300/e84393/ffffff?text=4+Pics+1+Word',
    coinCost: 2,
    rating: 4.5,
    players: '12.3K',
    badge: 'hot'
  },
  {
    id: '2',
    title: 'Cooking Panic!',
    category: 'Simulation',
    image: 'https://placehold.co/400x300/6c5ce7/ffffff?text=Cooking+Panic',
    coinCost: 3,
    rating: 4.8,
    players: '8.7K',
    badge: 'pick'
  },
  {
    id: '3',
    title: 'Mystery Box',
    category: 'Adventure',
    image: 'https://placehold.co/400x300/fdcb6e/333333?text=Mystery+Box',
    coinCost: 5,
    rating: 4.2,
    players: '15.1K',
    badge: 'hot'
  },
  {
    id: '4',
    title: 'Memory Flash',
    category: 'Puzzle',
    image: 'https://placehold.co/400x300/a29bfe/ffffff?text=Memory+Flash',
    coinCost: 1,
    rating: 4.0,
    players: '5.2K',
    badge: null
  },
  {
    id: '5',
    title: 'Neon Racer',
    category: 'Racing',
    image: 'https://placehold.co/400x300/0984e3/ffffff?text=Neon+Racer',
    coinCost: 4,
    rating: 4.5,
    players: '22.5K',
    badge: 'hot'
  },
  {
    id: '6',
    title: 'Brain Trivia',
    category: 'Trivia',
    image: 'https://placehold.co/400x300/fd79a8/ffffff?text=Brain+Trivia',
    coinCost: 2,
    rating: 4.3,
    players: '9.8K',
    badge: null
  },
  {
    id: '7',
    title: 'Arena Clash',
    category: 'Action',
    image: 'https://placehold.co/400x300/e17055/ffffff?text=Arena+Clash',
    coinCost: 3,
    rating: 4.7,
    players: '18.6K',
    badge: 'pick'
  },
  {
    id: '8',
    title: 'Word Wizard',
    category: 'Puzzle',
    image: 'https://placehold.co/400x300/00cec9/333333?text=Word+Wizard',
    coinCost: 2,
    rating: 4.1,
    players: '6.4K',
    badge: null
  },
  {
    id: '9',
    title: 'Space Drift',
    category: 'Racing',
    image: 'https://placehold.co/400x300/2d3436/ffffff?text=Space+Drift',
    coinCost: 5,
    rating: 4.6,
    players: '14.2K',
    badge: 'hot'
  },
  {
    id: '10',
    title: 'Farm Builder',
    category: 'Simulation',
    image: 'https://placehold.co/400x300/55efc4/333333?text=Farm+Builder',
    coinCost: 3,
    rating: 4.4,
    players: '11.8K',
    badge: 'pick'
  },
  {
    id: '11',
    title: 'Dungeon Quest',
    category: 'Adventure',
    image: 'https://placehold.co/400x300/636e72/ffffff?text=Dungeon+Quest',
    coinCost: 4,
    rating: 4.3,
    players: '9.1K',
    badge: null
  },
  {
    id: '12',
    title: 'Quiz Master',
    category: 'Trivia',
    image: 'https://placehold.co/400x300/ffeaa7/333333?text=Quiz+Master',
    coinCost: 1,
    rating: 4.0,
    players: '7.5K',
    badge: null
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
