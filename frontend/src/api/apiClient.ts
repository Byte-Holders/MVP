import { fetchAuthSession } from 'aws-amplify/auth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function getAuthHeader(): Promise<{ Authorization: string }> {
  const session = await fetchAuthSession()
  const token = session.tokens?.accessToken?.toString()
  return { Authorization: `Bearer ${token}` }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Errore HTTP ${response.status}`
    try {
      const body = await response.json()
      if (typeof body?.message === 'string') message = body.message
    } catch {}
    throw new ApiError(response.status, message)
  }
  const text = await response.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

export async function apiGet<T>(path: string): Promise<T> {
  const authHeader = await getAuthHeader()
  const response = await fetch(`${BASE_URL}${path}`, { headers: authHeader })
  return handleResponse<T>(response)
}

export async function apiPost<T = void>(
  path: string,
  body?: unknown,
): Promise<T> {
  const authHeader = await getAuthHeader()
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { ...authHeader, 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  return handleResponse<T>(response)
}

export async function apiPut<T = void>(
  path: string,
  body?: unknown,
): Promise<T> {
  const authHeader = await getAuthHeader()
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: { ...authHeader, 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  return handleResponse<T>(response)
}

export async function apiPatch<T = void>(
  path: string,
  body?: unknown,
): Promise<T> {
  const authHeader = await getAuthHeader()
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { ...authHeader, 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  return handleResponse<T>(response)
}

export async function apiDelete<T = void>(path: string): Promise<T> {
  const authHeader = await getAuthHeader()
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: authHeader,
  })
  return handleResponse<T>(response)
}
