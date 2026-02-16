import { AvatarShop } from '@/ui/pages/AvatarShop';
import { GamePage } from '@/ui/pages/GamePage';
import { PlayGamePage } from '@/ui/pages/PlayGamePage';
import { Favorites } from '@/ui/pages/Favorites';
import { Home } from '@/ui/pages/Home';
import { Login } from '@/ui/pages/Login';
import { NotFound } from '@/ui/pages/NotFound';
import { SignUp } from '@/ui/pages/SignUp';
import { Trending } from '@/ui/pages/Trending';
import { AdminGate } from '@/ui/pages/admin/AdminGate';
import { AdminGamesList } from '@/ui/pages/admin/AdminGamesList';
import { AdminGameContentPage } from '@/ui/pages/admin/AdminGameContentPage';
import { AdminLinkFourLevels } from '@/ui/pages/admin/AdminLinkFourLevels';
import { AdminImageUpload } from '@/ui/pages/admin/AdminImageUpload';
import { AdminRedirect } from '@/ui/pages/admin/AdminRedirect';
import { AdminLegacyLevelsRedirect } from '@/ui/pages/admin/AdminLegacyLevelsRedirect';
import { Root } from '@/ui/Root';
import { createBrowserRouter } from 'react-router';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: 'favorites', Component: Favorites },
      { path: 'trending', Component: Trending },
      { path: 'avatar-shop', Component: AvatarShop },
      { path: 'game/:gameId', Component: GamePage },
      { path: 'play/:gameId', Component: PlayGamePage },
      { path: 'login', Component: Login },
      { path: 'signup', Component: SignUp },
      {
        path: 'admin',
        Component: AdminGate,
        children: [
          { index: true, Component: AdminRedirect },
          { path: 'games', Component: AdminGamesList },
          { path: 'games/:gameId/content', Component: AdminGameContentPage },
          { path: 'levels', Component: AdminLegacyLevelsRedirect },
          { path: 'upload', Component: AdminImageUpload },
        ],
      },
    ]
  },
  {
    path: '*',
    Component: NotFound
  }
]);
