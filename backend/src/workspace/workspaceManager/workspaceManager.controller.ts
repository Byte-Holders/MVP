import { Body, Controller, Post, UseGuards, Req, Delete, Param } from '@nestjs/common'
import { WorkspaceManagerService } from './workspaceManager.service'
import { CreateWorkspaceDto } from './dto/CreateWorkspaceDto'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'  // vedi sotto
import { CreateWorkspaceResponseDto } from './dto/CreateWorkspaceDtoResponseDto'

@Controller('workspaces')
@UseGuards(JwtAuthGuard)  // protegge tutti gli endpoint del controller
export class WorkspaceManagerController {
  constructor(private readonly service: WorkspaceManagerService) {}

  @Post()
  async create(@Body() dto: CreateWorkspaceDto, @Req() req: any): Promise<CreateWorkspaceResponseDto> {
    const authenticatedUsername = req.user.username  // estratto dal token da JwtAuthGuard
    return this.service.createWorkspace(dto, authenticatedUsername)
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.service.deleteWorkspace(id)
  }
}