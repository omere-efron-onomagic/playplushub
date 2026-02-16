import { LinkFourGame } from '@/ui/pages/LinkFourGame';
import { CinemojiGame } from '@/ui/pages/CinemojiGame';
import { useParams } from 'react-router';

export function PlayGamePage() {
  const { gameId } = useParams<{ gameId: string }>();

  if (gameId === '13') {
    return <CinemojiGame />;
  }

  return <LinkFourGame />;
}
