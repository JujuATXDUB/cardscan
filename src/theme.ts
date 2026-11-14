// One place for the colours and spacing the whole app uses.
// Change a value here and every screen picks it up.
export const colors = {
  background: '#101418',
  surface: '#1b2128',
  text: '#f2f4f7',
  textMuted: '#9aa4b2',
  accent: '#ffcc00', // Pokémon yellow
  danger: '#ff5a5f',
  guide: 'rgba(255, 255, 255, 0.85)',
  scrim: 'rgba(0, 0, 0, 0.55)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// A standard trading card is 63mm x 88mm. We keep the guide box in that ratio
// so a card held up to the camera fills it neatly.
export const CARD_ASPECT_RATIO = 63 / 88;
