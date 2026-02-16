import { useParams, Link } from 'react-router';
import { useGetAdminGamesQuery } from '@/store/apis/admin.api';
import { getGameEditor, hasGameEditor } from './gameEditorRegistry';

/**
 * Generic game content page that loads the appropriate editor
 * based on the gameId param and the game editor registry.
 */
export function AdminGameContentPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const { data: games = [], isLoading } = useGetAdminGamesQuery();

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-gv-text-muted">Loading game...</p>
      </div>
    );
  }

  if (!gameId) {
    return (
      <div className="p-6">
        <p className="text-red-400">No game ID provided</p>
        <Link to="/admin/games" className="text-gv-gold hover:underline">
          Back to Games
        </Link>
      </div>
    );
  }

  const game = games.find((g) => g.gameId === gameId);
  
  if (!game) {
    return (
      <div className="p-6">
        <p className="text-red-400">Game not found: {gameId}</p>
        <Link to="/admin/games" className="text-gv-gold hover:underline">
          Back to Games
        </Link>
      </div>
    );
  }

  if (!hasGameEditor(gameId)) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <Link to="/admin/games" className="text-sm text-gv-text-muted hover:text-gv-gold">
            ← Back to Games
          </Link>
        </div>
        <h1 className="font-heading text-xl font-bold text-gv-gold mb-4">
          {game.title}
        </h1>
        <div className="rounded-lg border border-gv-border bg-gv-surface p-6">
          <p className="text-gv-text-muted">
            No admin editor is currently registered for this game.
          </p>
          <p className="mt-2 text-sm text-gv-text-muted">
            Game ID: <code className="text-gv-gold">{gameId}</code>
          </p>
        </div>
      </div>
    );
  }

  const EditorComponent = getGameEditor(gameId);
  
  if (!EditorComponent) {
    return (
      <div className="p-6">
        <p className="text-red-400">Editor component not found</p>
      </div>
    );
  }

  return <EditorComponent gameId={gameId} />;
}
