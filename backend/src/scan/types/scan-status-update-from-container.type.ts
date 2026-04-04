export const scanStatusUpdateFromContainer = ['completed', 'error'] as const;

export type ScanStatusUpdateFromContainer =
  (typeof scanStatusUpdateFromContainer)[number];
