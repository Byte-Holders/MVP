import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReportSchemaClass } from '../schemas/report.schema';
import type { IReportRepository } from '../interfaces/ireport.repository.interface';
import { ReportEntity } from '../entities/report.entity';

@Injectable()
export class ReportRepository implements IReportRepository {
  constructor(
    @InjectModel(ReportSchemaClass.name)
    private readonly reportModel: Model<ReportSchemaClass>,
  ) {}

  async save(report: ReportEntity): Promise<ReportEntity> {
    const { owner, repository, branch } = report.metadata!.target;
    const doc = await this.reportModel
      .findOneAndUpdate(
        {
          'metadata.target.owner': owner,
          'metadata.target.repository': repository,
          'metadata.target.branch': branch,
        },
        { $set: report },
        { upsert: true, returnDocument: 'after' },
      )
      .lean()
      .exec();

    return this.toEntity(doc);
  }

  async findLatestByTarget(
    owner: string,
    repository: string,
    branch: string,
  ): Promise<ReportEntity | null> {
    const doc = await this.reportModel
      .findOne({
        'metadata.target.owner': owner,
        'metadata.target.repository': repository,
        'metadata.target.branch': branch,
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    if (!doc) return null;
    return this.toEntity(doc);
  }

  private toEntity(doc: ReportSchemaClass): ReportEntity {
    return {
      summary: doc.summary,
      data: doc.data,
      metadata: doc.metadata
        ? {
            startScanTime: doc.metadata.startScanTime.toISOString(),
            endScanTime: doc.metadata.endScanTime.toISOString(),
            target: doc.metadata.target,
          }
        : undefined,
    };
  }
}
