export const SseEvent = {
  Ready: 'ready',
  Patch: 'patch',
} as const;

export type SseEvent = (typeof SseEvent)[keyof typeof SseEvent];

export const API_ERROR_MESSAGES = {
  invalidNodesResponse: (detail: string) =>
    `Invalid nodes response: ${detail}`,
  invalidPatchEvent: (detail: string) => `Invalid patch event: ${detail}`,
} as const;
