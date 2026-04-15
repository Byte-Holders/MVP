import { useMutation } from '@tanstack/react-query'
import { scanRepository } from '../model/scan'
import type { StartScanInfo } from '../model/scan'
import type {
  IScanViewModel,
  IStopScanViewModel,
} from '../interfaces/viewModel/IUseScan'

export function useScan(payload: StartScanInfo): IScanViewModel {
  const { mutate, isPending, isSuccess, error, reset, data } = useMutation({
    mutationFn: () => scanRepository.requestScan(payload),
  })

  return {
    triggerScan: mutate,
    scanId: data,
    isPending,
    isSuccess,
    error,
    reset,
  }
}

export function useStopScan(): IStopScanViewModel {
  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: (scanId: string) => scanRepository.stopScan(scanId),
  })

  return {
    triggerStop: mutate,
    isStopping: isPending,
    stopError: error,
    resetStop: reset,
  }
}
