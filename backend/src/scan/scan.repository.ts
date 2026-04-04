import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IScanRepository } from './interfaces/iscan.repository';
import { ScanSchemaClass, ScanDocument } from './schemas/scan.schema';
import { Scan } from './entities/scan.entity';
import { CreateScanDto } from './dtos/create-scan.dto';
import { FindStatusDto } from './dtos/find-status.dto';
import { UpdateScanDto } from './dtos/update-scan.dto';

export const SCAN_MODEL = ScanSchemaClass.name;

@Injectable()
export class ScanRepository implements IScanRepository {
  constructor(
    @InjectModel(SCAN_MODEL)
    private readonly scanModel: Model<ScanDocument>,
  ) {}

  async create(dto: CreateScanDto): Promise<void> {
    const doc = await this.scanModel.create({
      workspaceId: dto.workspaceId,
      target: {
        repositoryId: dto.repositoryId,
        branchName: dto.branch,
      },
      status: 'started',
      containerRef: dto.containerRef,
      startTime: new Date(),
      endTime: null,
      callbackToken: null,
    });

    console.log(
      `[ScanRepository] Scan creata — id: ${doc._id.toString()}, repo: ${dto.repositoryId}@${dto.branch}`,
    );
  }

  async find(dto: FindStatusDto): Promise<Scan | null> {
    const doc = await this.scanModel
      .findOne(this.buildQuery(dto.repositoryId, dto.branch))
      .sort({ startTime: -1 })
      .lean()
      .exec();

    return doc ? this.toEntity(doc as ScanDocument) : null;
  }

  async update(dto: UpdateScanDto): Promise<void> {
    const filter = this.buildQuery(dto.repositoryId, dto.branch);

    const $set: Partial<ScanDocument> = { status: dto.status };
    if (dto.endTime !== undefined) $set.endTime = dto.endTime;

    const result = await this.scanModel
      .updateOne(filter, { $set })
      .sort({ startTime: -1 })
      .exec();

    if (result.matchedCount === 0) {
      throw new NotFoundException(
        `Scan not found for ${dto.repositoryId}@${dto.branch}`,
      );
    }

    console.log(
      `[ScanRepository] Scan aggiornata — status: ${dto.status}, repo: ${dto.repositoryId}@${dto.branch}`,
    );
  }

  private buildQuery(repositoryId: string, branch: string) {
    return {
      'target.repositoryId': repositoryId,
      'target.branchName': branch,
    };
  }

  private toEntity(doc: ScanDocument): Scan {
    return new Scan({
      id: String(doc._id),
      workspaceId: doc.workspaceId,
      target: doc.target,
      status: doc.status,
      containerRef: doc.containerRef,
      startTime: doc.startTime,
      endTime: doc.endTime ?? undefined,
      callbackToken: doc.callbackToken ?? undefined,
    });
  }
}
