import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IScanRepository } from './scan.interfaces';
import { ScanSchemaClass, ScanDocument } from './scan.schema';
import {
  ScanStatus,
  CreateScanDto,
  UpdateScanDto,
  FindScanDto,
  SetScanStatusDto,
  Scan,
  ScanTarget,
  Workspace,
} from './dto';

export const SCAN_MODEL = ScanSchemaClass.name;

@Injectable()
export class ScanRepository implements IScanRepository {
  constructor(
    @InjectModel(SCAN_MODEL)
    private readonly scanModel: Model<ScanDocument>,
  ) {}

  // IScanRepository

  async create(dto: CreateScanDto): Promise<Scan> {
    const doc = await this.scanModel.create({
      workspace: { id: dto.workspace.id, name: dto.workspace.name },
      target: {
        repositoryName: dto.repository.name,
        branchName: dto.branch,
      },
      status: ScanStatus.Started,
      startTime: new Date(),
      endTime: null,
      callbackToken: null,
    });

    console.log(
      `[ScanRepository] Scan creata — id: ${doc._id}, repo: ${dto.repository.name}@${dto.branch}`,
    );

    return this.toEntity(doc);
  }

  async get(dto: FindScanDto): Promise<Scan | null> {
    const doc = await this.scanModel
      .findOne(this.buildQuery(dto.repository.name, dto.branch))
      .sort({ startTime: -1 })
      .lean()
      .exec();

    return doc ? this.toEntity(doc as ScanDocument) : null;
  }

  async update(dto: UpdateScanDto): Promise<void> {
    const filter = this.buildQuery(dto.repository.name, dto.branch);

    const $set: Partial<ScanDocument> = { status: dto.status };
    if (dto.endTime !== undefined) $set.endTime = dto.endTime;

    const result = await this.scanModel
      .updateOne(filter, { $set })
      .sort({ startTime: -1 }) // aggiorna la scan più recente
      .exec();

    if (result.matchedCount === 0) {
      throw new NotFoundException(
        `Scan non trovata per ${dto.repository.name}@${dto.branch}`,
      );
    }

    console.log(
      `[ScanRepository] Scan aggiornata — status: ${dto.status}, repo: ${dto.repository.name}@${dto.branch}`,
    );
  }

  async getScanStatus(dto: SetScanStatusDto): Promise<ScanStatus | null> {
    const doc = await this.scanModel
      .findOne(this.buildQuery(dto.repository.name, dto.branch), { status: 1 })
      .sort({ startTime: -1 })
      .lean()
      .exec();

    return (doc as ScanDocument | null)?.status ?? null;
  }

  private buildQuery(repositoryName: string, branch: string) {
    return {
      'target.repositoryName': repositoryName,
      'target.branchName': branch,
    };
  }

  /**
   A quanto pare necessario per isolare mongoose e non rendere il service o controller dipendenti da esso
   */
  private toEntity(doc: ScanDocument): Scan {
    const workspace: Workspace = {
      id: doc.workspace.id,
      name: doc.workspace.name,
    };

    const target = new ScanTarget(
      doc.target.repositoryName,
      doc.target.branchName,
    );

    return new Scan({
      id: String(doc._id),
      workspace,
      target,
      status: doc.status,
      startTime: doc.startTime,
      endTime: doc.endTime ?? undefined,
      callbackToken: doc.callbackToken ?? undefined,
    });
  }
}
