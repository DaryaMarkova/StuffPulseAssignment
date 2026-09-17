import type { ReactNode } from 'react';

export type MdlTooltipProps = {
  /** id целевого элемента (атрибут `for` у MDL tooltip). */
  forId: string;
  /** Текст или содержимое тултипа. */
  children: ReactNode;
  /** Доп. класс, например `mdl-tooltip--large`. */
  className?: string;
};
