import { WorkflowState } from './workflow-state.type';

export interface INodeScanService {
  scan(
    state: Partial<WorkflowState>,
  ): Promise<Partial<WorkflowState>> | Partial<WorkflowState>;
}
