export const NODE_UI_MESSAGES = {
  collapse: 'Collapse',
  expand: 'Expand',
  expandIcon: 'expand_more',
  collapseIcon: 'chevron_right',
  headcount: (value: number) => `Headcount: ${value}`,
  performance: (value: number) => `Performance: ${value}`,
  performanceAria: (value: number) => `Performance ${value}`,
  averagePerformance: (value: number) => `Average performance: ${value}`,
  averagePerformanceAria: (value: number) => `Average performance ${value}`,
  totalEmployees: (value: number) => `Total employees: ${value}`,
  totalBudget: (label: string) => `Total budget: ${label}`,
  level: (value: number) => `Level: ${value}`,
  selected: (name: string) => `Selected: ${name}`,
  select: (name: string) => `Select ${name}`,
} as const;

export const NODE_CURRENCY = {
  locale: 'ru-RU',
  suffix: 'RUB',
} as const;
