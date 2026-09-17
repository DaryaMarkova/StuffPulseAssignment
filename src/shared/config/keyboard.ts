export const KeyboardKey = {
  ArrowDown: 'ArrowDown',
  ArrowUp: 'ArrowUp',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  Home: 'Home',
  End: 'End',
  Enter: 'Enter',
  Space: ' ',
} as const;

export type KeyboardKey = (typeof KeyboardKey)[keyof typeof KeyboardKey];
