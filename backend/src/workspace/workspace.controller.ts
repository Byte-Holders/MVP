import { Body, Controller, Param, Post, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateWorkspaceDto } from './dtos/CreateWorkspaceDto';

@Controller('workspace')
export class WorkspaceController {
    constructor(private workspaceService: WorkspaceService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async createWorkspace(@Body() createWorkspaceDto: CreateWorkspaceDto, @Request() req) {
        return req.user;
    }

    @Post('no-guard/:userID')
    @UsePipes(new ValidationPipe())
    async createNoGuard(@Body() createWorkspaceDto: CreateWorkspaceDto, @Param('userID') userID: string) {
        return this.workspaceService.createWorkspace(createWorkspaceDto, userID);
    }
}
