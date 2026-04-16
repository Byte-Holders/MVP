export interface ICheckIfUserInWorkspace {
  checkIfUserIsInWorkspace(workspaceId: string, userId: string): Promise<boolean>;
}

export const ICheckIfUserInWorkspaceToken = 'ICheckIfUserInWorkspace';