import { Button } from '#/components/ui/button'
import { useScan } from '../hooks/useScan'

interface ScanButtonProps {
  workspaceId: string
  repositoryId: string
  branch: string
}

export function ScanButton({
  repositoryId,
  branch,
  workspaceId,
}: ScanButtonProps) {
  const { triggerScan } = useScan({ workspaceId, repositoryId, branch })

  return (
    <div>
      <Button onClick={triggerScan}>Scan</Button>
    </div>
  )
}
