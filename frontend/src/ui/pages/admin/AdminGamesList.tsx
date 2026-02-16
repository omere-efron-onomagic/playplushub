import { Link } from 'react-router';
import { useGetAdminGamesQuery } from '@/store/apis/admin.api';
import { toImageUrl } from '@/utils/imageUrl';

export function AdminGamesList() {
  const { data: games = [], isLoading, error } = useGetAdminGamesQuery();

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-gv-text-muted">Loading games...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-400">
          Failed to load games. Check your admin secret.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-gv-gold">
          Games
        </h1>
        <Link
          to="/admin/levels"
          className="rounded-lg border border-gv-gold px-4 py-2 text-sm font-medium text-gv-gold"
        >
          Manage Levels
        </Link>
      </div>
      <div className="space-y-4">
        {games.map((g) => (
          <div
            key={g.gameId}
            className="flex items-center gap-4 rounded-xl border border-gv-border bg-gv-surface p-4"
          >
            <img
              src={toImageUrl(g.coverImageUrl)}
              alt={g.title}
              className="h-16 w-24 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-gv-text">{g.title}</h2>
              <p className="text-xs text-gv-text-muted">
                ID: {g.gameId} | {g.coinCost} coins | {g.rewardCoins} reward
                {g.totalLevels != null ? ` | ${g.totalLevels} levels` : ''}
              </p>
            </div>
            <Link
              to="/admin/levels"
              className="rounded-lg bg-gv-gold/20 px-3 py-1.5 text-sm text-gv-gold"
            >
              Levels
            </Link>
          </div>
        ))}
      </div>
      {games.length === 0 && (
        <p className="text-gv-text-muted">No games yet.</p>
      )}
    </div>
  );
}
