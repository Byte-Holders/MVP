import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { IReportService } from '../interfaces/ireport.service.interface';
import { ReportServiceToken } from '../interfaces/ireport.service.interface';
import { SaveReportDto } from '../dtos/save-report.dto';
import { ReportResponseDto } from '../dtos/report-response.dto';

@Controller('reports')
export class ReportController {
  constructor(
    @Inject(ReportServiceToken)
    private readonly reportService: IReportService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async saveReport(@Body() dto: SaveReportDto): Promise<void> {
    return this.reportService.saveReport(dto);
  }

  @Get(':repositoryId/branches/:branch')
  async getReport(
    @Param('repositoryId') repositoryId: string,
    @Param('branch') branch: string,
  ): Promise<ReportResponseDto> {
    const report = await this.reportService.getReport(repositoryId, branch);
    return { ...report };
  }
}
