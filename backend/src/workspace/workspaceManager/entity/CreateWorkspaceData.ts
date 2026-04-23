import { WorkspaceRole } from '../../roles.enum';

export type CreateWorkspaceData = {
  name: string;
  ownerId: string;
  ownerUsername: string;
  creationDate: Date;
  initialMembers: {
    userId: string;
    userUsername: string;
    role: WorkspaceRole;
  }[];
};
