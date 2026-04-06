import { Body, Controller, Post, UseGuards, Req, Delete, Param } from '@nestjs/common'
import { WorkspaceManagerService } from './workspaceManager.service'
import { CreateWorkspaceDto } from './dto/CreateWorkspaceDto'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'  // vedi sotto
import { CreateWorkspaceResponseDto } from './dto/CreateWorkspaceResponseDto'

@Controller('workspaces')
@UseGuards(JwtAuthGuard)  // protegge tutti gli endpoint del controller
export class WorkspaceManagerController {
  constructor(private readonly service: WorkspaceManagerService) {}

  @Post()
  async create(@Body() dto: CreateWorkspaceDto, @Req() req: any): Promise<CreateWorkspaceResponseDto> {
    return this.service.createWorkspace(dto, req.user.username, req.user.sub)// estratto dal token da JwtAuthGuard
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.service.deleteWorkspace(id)
  }
}