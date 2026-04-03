import { useState } from 'react'
import { fetchAuthSession } from 'aws-amplify/auth'
import { NewWorkspaceDialog } from './FormNewWorkspace'

export function WorkspacesPage() {
  const [token, setToken] = useState<string | null>(null)
  const [idtoken, setidToken] = useState<string | null>(null)

  async function printToken() {
    const session = await fetchAuthSession()

    const accessToken = session.tokens?.accessToken?.toString()
    const idToken = session.tokens?.idToken?.toString()

    console.log('ACCESS TOKEN:', accessToken)
    console.log('ID TOKEN:', idToken)

    setToken(accessToken || null)
    setidToken(idToken || null)
  }

  return (
    <div>

      <div>Workspace List</div>
      <NewWorkspaceDialog />
      <button onClick={printToken}>Stampa token</button>

      {token && (
        <div style={{ marginTop: '20px', wordBreak: 'break-all' }}>
          <strong>Access Token:</strong>
          <p>{token}</p>
          <strong>id Token:</strong>
          <p>{idtoken}</p>
        </div>
      )}
    </div>
  )
}


