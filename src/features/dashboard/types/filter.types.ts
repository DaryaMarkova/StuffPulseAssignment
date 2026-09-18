import type { AiSearchMode } from './aiSearch.types';

export type FilterProps = {
  value: string;
  onChange: (value: string) => void;
  /** Режим: structured AI-фильтр или текстовый fallback. */
  searchMode?: AiSearchMode;
};
