import { Navigate } from 'react-router';

/**
 * Legacy redirect from /admin/levels to the new game-scoped content page.
 * Defaults to Link Four (gameId '1') for backward compatibility.
 */
export function AdminLegacyLevelsRedirect() {
  return <Navigate to="/admin/games/1/content" replace />;
}
