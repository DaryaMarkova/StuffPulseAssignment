import type { ReactNode } from 'react';

export type WithTooltipProps = {
  /** Уникальный id целевого элемента. */
  id: string;
  /** Текст тултипа. */
  tooltip: ReactNode;
  /** Содержимое, на которое вешается тултип. */
  children: ReactNode;
  /** CSS-класс целевого элемента. */
  className?: string;
};
