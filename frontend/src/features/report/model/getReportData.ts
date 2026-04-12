import { fetchAuthSession } from 'aws-amplify/auth'
import type { ReportInfo } from '../types/report'

export async function getReportData(
  repositoryId: string,
  branch: string,
): Promise<ReportInfo> {
  const session = await fetchAuthSession()
  const token = session.tokens?.accessToken?.toString()

  const response = await fetch(
    `/api/reports/${repositoryId}/branches/${branch}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!response.ok) throw new Error('Report non trovato')
  return response.json() as Promise<ReportInfo>
}
