import { IsString} from 'class-validator'
import { MemberBo } from './MemberBo';

export class CreateWorkspaceBo {
  name!: string
  ownerId!: string      // userId dal token
  ownerUsername!: string // username dal token — serve al service
}
