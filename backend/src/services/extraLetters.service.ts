const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Generate extra letters for Link Four level.
 * Answer letters are excluded; we add random letters to form the bank.
 * Count targets roughly 2x answer length for a typical puzzle difficulty.
 */
export function generateExtraLetters(answer: string, count = 8): string {
  const upper = answer.toUpperCase().replace(/[^A-Z]/g, '');
  const used = new Set(upper.split(''));
  const available = ALPHABET.split('').filter((c) => !used.has(c));
  const shuffle = <T>(a: T[]): T[] => {
    const out = [...a];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  const picked = shuffle(available).slice(0, Math.min(count, available.length));
  return picked.join('');
}
