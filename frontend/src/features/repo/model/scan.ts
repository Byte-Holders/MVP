import axios, { type AxiosRequestConfig } from 'axios'

export interface StartScanInfo {
  workspaceId: string
  repositoryId: string
  branch: string
}

export async function requestScan(
  payload: StartScanInfo,
  token: string,
): Promise<string> {
  const config: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.post<{ scanId: string }>(
    '/api/scan',
    payload,
    config,
  )

  if (response.status >= 400) {
    throw new Error(`Errore lancio scansione: ${response.data}`)
  }

  return response.data.scanId
}

export async function stopScan(scanId: string, token: string): Promise<void> {
  const config: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.patch('/api/scan', { scanId }, config)

  if (response.status >= 400) {
    throw new Error(`Errore stop scansione: ${response.data}`)
  }
}
