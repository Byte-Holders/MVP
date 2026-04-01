import {
  Body,
  Controller,
  Param,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateWorkspaceDto } from './dtos/CreateWorkspaceDto';
import { User } from 'src/auth/customDecorators/user.decorator';
import type { RequestUser } from 'src/auth/types/requestUser.type';

@Controller('workspace')
export class WorkspaceController {
  constructor(private workspaceService: WorkspaceService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UsePipes(new ValidationPipe())
  async createWorkspace(
    @Body() createWorkspaceDto: CreateWorkspaceDto,
    @User() user: RequestUser,
  ) {
    console.log(createWorkspaceDto);
    console.log(user);
    return;
  }

  //questo solo per testare senza guardia, poi da eliminare
  @Post('no-guard/:userID')
  @UsePipes(new ValidationPipe())
  async createNoGuard(
    @Body() createWorkspaceDto: CreateWorkspaceDto,
    @Param('userID') userID: string,
  ) {
    return this.workspaceService.createWorkspace(createWorkspaceDto, userID);
  }
}
