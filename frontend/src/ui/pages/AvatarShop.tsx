import { avatars } from '@/data/avatars';

export function AvatarShop() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-2 text-center">
        <h1 className="font-heading text-3xl font-bold tracking-wider text-gv-gold">
          AVATAR SHOP
        </h1>
        <p className="mt-1 text-sm text-gv-text-muted">
          Upgrade your avatar with coins earned from playing games
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {avatars.map((avatar) => (
          <div
            key={avatar.id}
            className={`group relative overflow-hidden rounded-2xl border transition-all ${
              avatar.equipped
                ? 'border-gv-gold shadow-lg shadow-gv-gold/10'
                : 'border-gv-border hover:border-gv-gold/30'
            } bg-gv-surface`}
          >
            {/* Avatar Image */}
            <div className="relative aspect-[3/3.5] overflow-hidden bg-gradient-to-b from-gv-gold/10 to-transparent">
              <img
                src={avatar.image}
                alt={avatar.name}
                className="h-full w-full object-cover"
              />
              {/* Level Badge */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                <div className="rounded-lg border border-gv-gold bg-gv-bg/90 px-4 py-1 backdrop-blur-sm">
                  <span className="font-heading text-xs font-bold tracking-wider text-gv-gold">
                    LEVEL {avatar.level}
                  </span>
                </div>
              </div>

              {/* Equipped indicator */}
              {avatar.equipped && (
                <div className="absolute top-3 right-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                    <span className="text-xs text-white">{'\u2713'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-gv-text">{avatar.name}</h3>
                <span className="text-xs text-gv-text-muted">Lvl. {avatar.level}</span>
              </div>

              {/* Perks */}
              <ul className="mb-4 space-y-1">
                {avatar.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2 text-xs text-gv-text-muted">
                    <span className="text-gv-gold">{'\u2022'}</span>
                    {perk}
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              {avatar.equipped ? (
                <button className="w-full rounded-lg border border-gv-gold bg-gv-gold/10 py-2 font-heading text-xs font-bold tracking-wider text-gv-gold">
                  EQUIPPED
                </button>
              ) : (
                <button className="w-full rounded-lg bg-gradient-to-r from-gv-gold-dark via-gv-gold to-gv-gold-dark py-2 font-heading text-xs font-bold tracking-wider text-gv-bg transition-all hover:shadow-lg hover:shadow-gv-gold/20">
                  {'\uD83E\uDE99'} {avatar.coinCost} COINS
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
