import axios, { type AxiosRequestConfig } from 'axios'

export interface StartScanInfo {
  workspaceId: string
  repositoryId: string
  branch: string
}

export async function requestScan(
  payload: StartScanInfo,
  token: string,
): Promise<void> {
  const config: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.post(
    'http://localhost:3001/scan',
    payload,
    config,
  )

  if (response.status >= 400) {
    throw new Error(`Errore lancio scansione: ${response.data}`)
  }
}
