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

@Controller('reports')
export class ReportController {
  constructor(
    @Inject(ReportServiceToken)
    private readonly reportService: IReportService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
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

  @Get(':repositoryId/branches/:branch')
  @UseGuards(JwtAuthGuard)
  async getReport(
    @Param('repositoryId') repositoryId: string,
    @Param('branch') branch: string,
  ): Promise<ReportResponseDto> {
    const report = await this.reportService.getReport(repositoryId, branch);
    return { ...report };
  }
}
