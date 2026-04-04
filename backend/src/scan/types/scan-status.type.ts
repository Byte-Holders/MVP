export const scanStatus = ['started', 'completed', 'stopped', 'error'] as const;

export type ScanStatus = (typeof scanStatus)[number];
