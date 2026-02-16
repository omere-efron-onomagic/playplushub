import { avatarItems } from '@/data/items';
import { useAppSelector } from '@/store/hooks';
import { useState } from 'react';
import type { AvatarItem } from '@/types/avatarItem.type';

export function AvatarShop() {
  const user = useAppSelector((state) => state.user);
  const userLevel = 1;

  const [items, setItems] = useState<AvatarItem[]>(avatarItems);

  const handleBuy = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, owned: true } : item,
      ),
    );
  };

  const handleEquip = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target || !target.owned) return;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) return { ...item, equipped: true };
        if (item.category === target.category && item.equipped)
          return { ...item, equipped: false };
        return item;
      }),
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-3 py-6 sm:px-4 sm:py-8">
      <div className="mb-2 text-center">
        <h1 className="font-heading text-2xl font-bold tracking-wider text-gv-gold sm:text-3xl">
          AVATAR ITEMS
        </h1>
        <p className="mt-1 text-xs text-gv-text-muted sm:text-sm">
          Unlock items by leveling up, buy them with coins
        </p>
      </div>

      {/* Coins bar */}
      <div className="mb-6 flex items-center justify-center gap-2 sm:mb-8">
        <div className="flex items-center gap-1.5 rounded-full border border-gv-gold/40 bg-gv-gold/10 px-4 py-1.5">
          <span className="text-sm">{'\uD83E\uDE99'}</span>
          <span className="font-heading text-sm font-bold text-gv-gold">
            {user.coins}
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-gv-border bg-gv-surface px-4 py-1.5">
          <span className="text-sm">{'\u2B50'}</span>
          <span className="font-heading text-sm font-bold text-gv-text">
            Level {userLevel}
          </span>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
        {items.map((item) => {
          const locked = userLevel < item.levelRequired;
          const canBuy = !locked && !item.owned && user.coins >= item.coinCost;
          const tooExpensive = !locked && !item.owned && user.coins < item.coinCost;

          return (
            <div
              key={item.id}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all ${
                item.equipped
                  ? 'border-gv-gold shadow-lg shadow-gv-gold/20'
                  : item.owned
                    ? 'border-green-500/40 hover:border-green-500/60'
                    : locked
                      ? 'border-gv-border/40 opacity-60'
                      : 'border-gv-border hover:border-gv-gold/40'
              } bg-gv-surface`}
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-gv-bg to-gv-surface">
                <img
                  src={item.image}
                  alt={item.name}
                  className={`h-full w-full object-cover transition-transform ${
                    locked ? 'blur-[2px] grayscale' : 'group-hover:scale-105'
                  }`}
                />

                {/* Lock overlay */}
                {locked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                    <span className="text-2xl sm:text-3xl">{'\uD83D\uDD12'}</span>
                    <span className="mt-1 rounded-full bg-gv-bg/80 px-2 py-0.5 text-[10px] font-bold text-gv-text-muted sm:text-xs">
                      LVL {item.levelRequired}
                    </span>
                  </div>
                )}

                {/* Equipped badge */}
                {item.equipped && (
                  <div className="absolute top-2 right-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 shadow-lg">
                      <span className="text-xs text-white">{'\u2713'}</span>
                    </div>
                  </div>
                )}

                {/* Owned badge */}
                {item.owned && !item.equipped && (
                  <div className="absolute top-2 right-2">
                    <div className="rounded-full bg-gv-surface/90 px-2 py-0.5 text-[10px] font-bold text-green-400 border border-green-500/40">
                      OWNED
                    </div>
                  </div>
                )}

                {/* Category tag */}
                <div className="absolute top-2 left-2">
                  <div className="rounded-full bg-gv-bg/80 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-gv-text-muted backdrop-blur-sm">
                    {item.category === 'hand-item' ? 'hand' : 'item'}
                  </div>
                </div>
              </div>

              {/* Info + Action */}
              <div className="flex flex-1 flex-col gap-2 p-2.5 sm:p-3">
                <h3 className="text-xs font-semibold text-gv-text sm:text-sm">
                  {item.name}
                </h3>

                {/* Action Button */}
                {locked ? (
                  <button
                    disabled
                    className="mt-auto w-full rounded-lg border border-gv-border/50 bg-gv-bg py-2 text-[10px] font-bold tracking-wider text-gv-text-muted sm:text-xs"
                  >
                    {'\uD83D\uDD12'} LEVEL {item.levelRequired}
                  </button>
                ) : item.equipped ? (
                  <button
                    disabled
                    className="mt-auto w-full rounded-lg border border-gv-gold bg-gv-gold/10 py-2 text-[10px] font-bold tracking-wider text-gv-gold sm:text-xs"
                  >
                    {'\u2713'} EQUIPPED
                  </button>
                ) : item.owned ? (
                  <button
                    onClick={() => handleEquip(item.id)}
                    className="mt-auto w-full rounded-lg border border-green-500/60 bg-green-500/10 py-2 text-[10px] font-bold tracking-wider text-green-400 transition-all hover:bg-green-500/20 active:scale-[0.97] sm:text-xs"
                  >
                    EQUIP
                  </button>
                ) : canBuy ? (
                  <button
                    onClick={() => handleBuy(item.id)}
                    className="mt-auto w-full rounded-lg bg-gradient-to-r from-gv-gold-dark via-gv-gold to-gv-gold-dark py-2 text-[10px] font-bold tracking-wider text-gv-bg transition-all hover:shadow-lg hover:shadow-gv-gold/20 active:scale-[0.97] sm:text-xs"
                  >
                    {'\uD83E\uDE99'} {item.coinCost}
                  </button>
                ) : tooExpensive ? (
                  <button
                    disabled
                    className="mt-auto w-full rounded-lg border border-red-500/30 bg-red-500/5 py-2 text-[10px] font-bold tracking-wider text-red-400/70 sm:text-xs"
                  >
                    {'\uD83E\uDE99'} {item.coinCost}
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
