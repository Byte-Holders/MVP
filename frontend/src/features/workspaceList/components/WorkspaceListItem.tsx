import type { WorkspaceListItem } from '../types/Workspace'
import { Card, CardContent } from '@/components/ui/card'
import { Link } from '@tanstack/react-router'

type Props = { workspace: WorkspaceListItem }

export function WorkspaceListItem({ workspace }: Props) {
  return (
    <Link to="/workspaces/$workspaceId/repositories" params={{ workspaceId: workspace.id }}>
      <Card className="hover:shadow-md transition-all cursor-pointer">
      <CardContent className="flex items-center justify-between p-4">

        {/* LEFT */}
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold">
            {workspace.name.charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div>
            <p className="font-semibold text-base">{workspace.name}</p>
            <p className="text-sm text-muted-foreground">
              Owner: {workspace.owner}
            </p>
            <p className="text-sm text-muted-foreground">
              Role: {workspace.role}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-sm">→</span>
        </div>

      </CardContent>
    </Card>
    </Link>
  )
}