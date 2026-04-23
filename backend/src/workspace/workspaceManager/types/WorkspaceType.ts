import { IsString } from 'class-validator';
import { MemberBo } from './MemberType';

// Questo è il contratto di risposta tra Service e Controller
export class WorkspaceBo {
  id!: string;
  name!: string;
  ownerId!: string;
  ownerUsername!: string;
  creationDate!: Date;
  members!: MemberBo[];
  repositoryIds!: string[];

  isOwner(userId: string): boolean {
    return this.ownerId === userId;
  }
}
