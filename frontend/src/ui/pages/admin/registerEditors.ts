import { registerGameEditor } from './gameEditorRegistry';
import { LinkFourEditor } from './linkfour';
import { CinemojiEditor } from './cinemoji';

/**
 * Register all game editors.
 * This must be imported early in the app lifecycle.
 */
export function registerAllGameEditors(): void {
  // Link Four (gameId: '1')
  registerGameEditor('1', LinkFourEditor);
  
  // Cinemoji (gameId: '13')
  registerGameEditor('13', CinemojiEditor);
}
