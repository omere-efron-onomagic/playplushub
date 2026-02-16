import { AvatarShop } from '@/ui/pages/AvatarShop';
import { GamePage } from '@/ui/pages/GamePage';
import { PlayGamePage } from '@/ui/pages/PlayGamePage';
import { Favorites } from '@/ui/pages/Favorites';
import { Home } from '@/ui/pages/Home';
import { Login } from '@/ui/pages/Login';
import { NotFound } from '@/ui/pages/NotFound';
import { SignUp } from '@/ui/pages/SignUp';
import { Trending } from '@/ui/pages/Trending';
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
      { path: 'signup', Component: SignUp }
    ]
  },
  {
    path: '*',
    Component: NotFound
  }
]);
