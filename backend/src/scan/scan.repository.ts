import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScanSchemaClass } from './schemas/scan.schema';
import { IScanRepository } from './interfaces/iscan.repository';
import { Scan } from './entities/scan.entity';

@Injectable()
export class ScanRepository implements IScanRepository {
  constructor(
    @InjectModel(ScanSchemaClass.name)
    private readonly scanModel: Model<Scan>,
  ) {}

  async create(scan: Scan): Promise<Scan> {
    const doc = await this.scanModel.create(scan);
    return doc;
  }

  async find(id: string): Promise<Scan | null> {
    const scan = await this.scanModel.findOne({ id: id }).lean().exec();

    return scan;
  }

  async findByToken(callbackToken: string): Promise<Scan | null> {
    const scan = await this.scanModel.findOne({ callbackToken }).lean().exec();
    return scan;
  }

  async update(id: string, updated: Partial<Scan>): Promise<Scan | null> {
    const result = await this.scanModel
      .findOneAndUpdate({ id: id }, updated, { returnDocument: 'after' })
      .exec();

    return result;
  }
}
