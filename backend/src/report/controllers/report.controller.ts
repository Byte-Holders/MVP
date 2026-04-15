import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { IReportService } from '../interfaces/ireport.service.interface';
import { ReportServiceToken } from '../interfaces/ireport.service.interface';
import { SaveReportDto } from '../dtos/save-report.dto';
import { ReportResponseDto } from '../dtos/report-response.dto';
import type { ReportInfo } from '../types/report.type';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { User } from '../../auth/customDecorators/user.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('reports')
@Controller()
export class ReportController {
  constructor(
    @Inject(ReportServiceToken)
    private readonly reportService: IReportService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiOperation({
    summary: 'Salva un report (chiamata dal container di scansione)',
  })
  @ApiResponse({ status: 201, description: 'Report salvato' })
  @ApiResponse({ status: 401, description: 'Token scan non valido o scaduto' })
  @Post('reports')
  @UsePipes(new ValidationPipe({ transform: true }))
  async saveReport(@Body() dto: SaveReportDto): Promise<void> {
    let repositoryId: string;
    try {
      const payload = await this.jwtService.verifyAsync<{
        repositoryId: string;
        branch: string;
      }>(dto.token);
      repositoryId = payload.repositoryId;
    } catch {
      throw new UnauthorizedException('Token non valido o scaduto');
    }

    const branch = dto.report.metadata?.target?.branch ?? '';
    const reportInfo: ReportInfo = {
      summary: dto.report.summary,
      data: dto.report.data,
      metadata: dto.report.metadata
        ? {
            startScanTime: dto.report.metadata.startScanTime,
            endScanTime: dto.report.metadata.endScanTime,
            target: { repositoryId, branch },
          }
        : undefined,
    };

    return this.reportService.saveReport(reportInfo);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Recupera il report di una branch' })
  @ApiParam({ name: 'repositoryId', description: 'ID del repository' })
  @ApiParam({ name: 'branch', description: 'Nome della branch' })
  @ApiResponse({
    status: 200,
    description: 'Report trovato',
    type: ReportResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Report non trovato' })
  @Get('repositories/:repositoryId/branches/:branch/report')
  @UseGuards(JwtAuthGuard)
  async getReport(
    @Param('repositoryId') repositoryId: string,
    @Param('branch') branch: string,
    @User() user: { userId: string },
  ): Promise<ReportResponseDto> {
    const report = await this.reportService.getReport(
      repositoryId,
      branch,
      user.userId,
    );
    return { ...report };
  }
}
