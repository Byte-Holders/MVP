export interface IScanViewModel {
  triggerScan: () => void
  scanId: string | undefined
  isPending: boolean
  isSuccess: boolean
  error: Error | null
  reset: () => void
}

export interface IStopScanViewModel {
  triggerStop: (scanId: string) => void
  isStopping: boolean
  stopError: Error | null
  resetStop: () => void
}

export interface IScanStatusViewModel {
  scanStatus: string | undefined
  isStatusLoading: boolean
}
