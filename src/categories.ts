/**
 * The kinds of card the app can identify.
 *
 * `segment` is the name CardSight AI uses for each category. The user picks
 * one on the camera screen so the identifier knows which catalogue to search.
 */
export type Category = {
  segment: string; // sent to the server
  label: string; // shown to the user
  emoji: string;
};

export const CATEGORIES: Category[] = [
  { segment: 'baseball', label: 'Baseball', emoji: '⚾' },
  { segment: 'football', label: 'Football', emoji: '🏈' },
  { segment: 'basketball', label: 'Basketball', emoji: '🏀' },
  { segment: 'hockey', label: 'Hockey', emoji: '🏒' },
  { segment: 'soccer', label: 'Soccer', emoji: '⚽' },
  { segment: 'mma', label: 'MMA', emoji: '🥊' },
  { segment: 'pokemon', label: 'Pokémon', emoji: '⚡' },
  { segment: 'magic', label: 'Magic', emoji: '🔮' },
  { segment: 'onepiece', label: 'One Piece', emoji: '🏴‍☠️' },
  { segment: 'marvel', label: 'Marvel', emoji: '🦸' },
  { segment: 'disney', label: 'Disney', emoji: '🏰' },
];

export const DEFAULT_CATEGORY = CATEGORIES[0];

export function findCategory(segment: string | undefined): Category {
  return CATEGORIES.find((c) => c.segment === segment) ?? DEFAULT_CATEGORY;
}
