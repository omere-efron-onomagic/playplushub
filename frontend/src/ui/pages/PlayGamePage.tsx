import { LinkFourGame } from '@/ui/pages/LinkFourGame';
import { CinemojiGame } from '@/ui/pages/CinemojiGame';
import { QuizmoGame } from '@/ui/pages/QuizmoGame';
import { useParams } from 'react-router';

export function PlayGamePage() {
  const { gameId } = useParams<{ gameId: string }>();

  if (gameId === '13') {
    return <CinemojiGame />;
  }
  if (gameId === '14') {
    return <QuizmoGame />;
  }

  return <LinkFourGame />;
}
