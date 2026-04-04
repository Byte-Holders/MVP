// import { Injectable, NotFoundException } from '@nestjs/common';
// import { randomUUID } from 'crypto'; //Solo se creiamo noi ID e non mongo
// import { IScanRepository } from './scan.interfaces';
// import { Scan, ScanTarget } from './scan.dto';
// import {
//   ScanStatus,
//   CreateScanDto,
//   UpdateScanDto,
//   FindScanDto,
//   SetScanStatusDto,
// } from './scan.dto';

// @Injectable()
// export class ScanRepository implements IScanRepository {
//   private readonly store = new Map<string, Scan>();

//   private key(owner: string, repo: string, branch: string): string {
//     return `${owner}/${repo}#${branch}`;
//   }

//   private keyFromDto(dto: FindScanDto | SetScanStatusDto): string {
//     return this.key(dto.repository.owner, dto.repository.name, dto.branch);
//   }

//   async create(dto: CreateScanDto): Promise<Scan> {
//     const scan = new Scan({
//       id: randomUUID(), //Solo se creiamo noi ID e non mongo
//       workspace: dto.workspace,
//       target: new ScanTarget(dto.repository.name, dto.branch),
//       containerRef: dto.containerRef,
//       startTime: new Date(),
//       status: ScanStatus.Started,
//     });

//     const k = this.key(dto.repository.owner, dto.repository.name, dto.branch);
//     this.store.set(k, scan);

//     console.log(`[ScanRepository] Scan created — key: ${k}, id: ${scan.id}`);
//     return scan;
//   }

//   async get(dto: FindScanDto): Promise<Scan | null> {
//     return this.store.get(this.keyFromDto(dto)) ?? null;
//   }

//   async update(dto: UpdateScanDto): Promise<void> {
//     const k = this.key(dto.repository.owner, dto.repository.name, dto.branch);
//     const scan = this.store.get(k);

//     if (!scan) {
//       throw new NotFoundException(`Scan non trovata per la chiave: ${k}`);
//     }

//     scan.status = dto.status;
//     if (dto.containerRef !== undefined) scan.containerRef = dto.containerRef;
//     if (dto.endTime !== undefined) scan.endTime = dto.endTime;

//     console.log(
//       `[ScanRepository] Scan aggiornata — key: ${k}, status: ${dto.status}`,
//     );
//   }

//   async getScanStatus(dto: SetScanStatusDto): Promise<ScanStatus | null> {
//     const scan = this.store.get(this.keyFromDto(dto));
//     return scan?.status ?? null;
//   }
// }
