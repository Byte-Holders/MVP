export const scanStatus = ['running', 'error', 'canceled', 'finished'] as const;

export type ScanStatus = (typeof scanStatus)[number];
