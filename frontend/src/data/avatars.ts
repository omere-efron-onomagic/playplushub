import type { Avatar } from '@/types/avatar.type';

export const avatars: Avatar[] = [
  {
    id: '1',
    name: 'Rookie MC',
    level: 1,
    image: 'https://placehold.co/300x350/d4a520/0a0e17?text=Lvl+1',
    perks: ['Basic emotes', '2x coins'],
    coinCost: 0,
    equipped: true
  },
  {
    id: '2',
    name: 'Gold Chain',
    level: 10,
    image: 'https://placehold.co/300x350/e5a800/0a0e17?text=Lvl+10',
    perks: ['Gold hat', 'Extra community', '10% coin bonus'],
    coinCost: 100,
    equipped: false
  },
  {
    id: '3',
    name: 'Cash Stack',
    level: 20,
    image: 'https://placehold.co/300x350/b8860b/ffffff?text=Lvl+20',
    perks: ['Money effects', 'Custom emotes', '20% coin bonus'],
    coinCost: 250,
    equipped: false
  },
  {
    id: '4',
    name: 'Crown Royal',
    level: 30,
    image: 'https://placehold.co/300x350/8b6914/ffffff?text=Lvl+30',
    perks: ['Crown', 'Rare effects', '25% coin bonus', 'Custom emotes'],
    coinCost: 500,
    equipped: false
  },
  {
    id: '5',
    name: 'Skull Boss',
    level: 50,
    image: 'https://placehold.co/300x350/704214/ffffff?text=Lvl+50',
    perks: ['Club chain', 'Epic effects', '30% coin bonus', 'VIP access'],
    coinCost: 1000,
    equipped: false
  },
  {
    id: '6',
    name: 'King of Vault',
    level: 100,
    image: 'https://placehold.co/300x350/c8a000/0a0e17?text=Lvl+100',
    perks: ['Golden throne', 'Legendary effects', '50% coin bonus', 'All perks'],
    coinCost: 2500,
    equipped: false
  }
];
