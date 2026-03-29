import { createFileRoute } from '@tanstack/react-router'
import {WorkspacesPage} from '@/features/workspaceList/pages/Workspaces';


export const Route = createFileRoute('/workspaces')({
 component: WorkspacesPage
});