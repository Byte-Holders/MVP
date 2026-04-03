import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common'
import { WorkspaceManagerService } from './workspaceManager.service'
import { CreateWorkspaceDto } from './dto/CreateWorkspaceDto'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'  // vedi sotto

@Controller('workspaces')
@UseGuards(JwtAuthGuard)  // protegge tutti gli endpoint del controller
export class WorkspaceManagerController {
  constructor(private readonly service: WorkspaceManagerService) {}

  @Post()
  async create(@Body() dto: CreateWorkspaceDto, @Req() req: any) {
    const authenticatedUsername = req.user.username  // estratto dal token da JwtAuthGuard
    return this.service.createWorkspace(dto, authenticatedUsername)
  }
}