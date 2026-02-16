import { Navigate } from 'react-router';

export function AdminRedirect() {
  return <Navigate to="/admin/games" replace />;
}
