export const PerformanceLevel = {
  Low: 'low',
  Mid: 'mid',
  High: 'high',
} as const;

export type PerformanceLevel =
  (typeof PerformanceLevel)[keyof typeof PerformanceLevel];

export const PERFORMANCE_THRESHOLDS = {
  lowMax: 40,
  midMax: 70,
} as const;

export const PERFORMANCE_CHIP_CLASS: Record<PerformanceLevel, string> = {
  [PerformanceLevel.Low]: 'mdl-color--red-100 mdl-color-text--red-900',
  [PerformanceLevel.Mid]: 'mdl-color--amber-100 mdl-color-text--amber-900',
  [PerformanceLevel.High]:
    'mdl-color--deep-orange-100 mdl-color-text--deep-orange-900',
};

export const PERFORMANCE_BAR_CLASS: Record<PerformanceLevel, string> = {
  [PerformanceLevel.Low]: 'mdl-color--red',
  [PerformanceLevel.Mid]: 'mdl-color--amber',
  [PerformanceLevel.High]: 'mdl-color--deep-orange',
};
