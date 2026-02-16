import type { ComponentType } from 'react';

/**
 * Game editor registry maps gameId to its admin editor component.
 * Each game type has a dedicated content authoring interface.
 */

export interface GameEditorProps {
  gameId: string;
}

export type GameEditorComponent = ComponentType<GameEditorProps>;

// Registry will be populated with actual editor components
const editorRegistry = new Map<string, GameEditorComponent>();

/**
 * Register an editor component for a specific game.
 */
export function registerGameEditor(gameId: string, component: GameEditorComponent): void {
  editorRegistry.set(gameId, component);
}

/**
 * Get the registered editor component for a game.
 * Returns undefined if no editor is registered.
 */
export function getGameEditor(gameId: string): GameEditorComponent | undefined {
  return editorRegistry.get(gameId);
}

/**
 * Check if a game has a registered editor.
 */
export function hasGameEditor(gameId: string): boolean {
  return editorRegistry.has(gameId);
}

/**
 * Get all registered game IDs.
 */
export function getRegisteredGameIds(): string[] {
  return Array.from(editorRegistry.keys());
}
