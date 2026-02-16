export type ItemCategory = 'accessory' | 'hand-item';

export type AvatarItem = {
  id: string;
  name: string;
  image: string;
  coinCost: number;
  levelRequired: number;
  category: ItemCategory;
  owned: boolean;
  equipped: boolean;
};
