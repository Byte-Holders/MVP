import { useMutation, useQuery } from '@tanstack/react-query'
import { scanRepository } from '../model/scan'
import type { StartScanInfo } from '../model/scan'
import type {
  IScanViewModel,
  IScanStatusViewModel,
  IStopScanViewModel,
} from '../interfaces/viewModel/IUseScan'

const TERMINAL_STATES = ['completed', 'stopped', 'error']
const POLL_INTERVAL_MS = 3000

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

export function useScanStatus(
  scanId: string | undefined,
): IScanStatusViewModel {
  const { data: scanStatus, isLoading: isStatusLoading } = useQuery({
    queryKey: ['scanStatus', scanId],
    queryFn: () => scanRepository.getScanStatus(scanId!),
    enabled: !!scanId,
    refetchInterval: (query) =>
      TERMINAL_STATES.includes(query.state.data ?? '')
        ? false
        : POLL_INTERVAL_MS,
  })

  return { scanStatus, isStatusLoading }
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
