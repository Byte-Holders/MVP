import type { WorkspaceRole } from 'src/workspace/roles.enum';

export interface IUserRoleReader {
  getUserRoleForRepository(
    repositoryId: string,
    userId: string,
  ): Promise<WorkspaceRole | null>;
}

export const IUserRoleReaderToken = 'IUserRoleReader';
