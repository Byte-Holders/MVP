import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ISCAN_REPOSITORY_TOKEN,
  type IScanRepository,
} from '../interfaces/iscan.repository';
import { IScanManagerService } from './interfaces/iscan-manager.service';
import { Scan } from '../entities/scan.entity';
import { StartScanDto } from './dtos/start-scan.dto';
import { StopScanDto } from './dtos/stop-scan.dto';
import { CreateScanDto } from '../dtos/create-scan.dto';
import { ScanStatus } from '../scan-status/enums/scan-status.enum';
import {
  ECSClient,
  RunTaskCommand,
  StopTaskCommand,
  StopTaskCommandInput,
} from '@aws-sdk/client-ecs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ScanManagerService implements IScanManagerService {
  constructor(
    // TODO injection WorkspaceUserService
    @Inject(ISCAN_REPOSITORY_TOKEN)
    private readonly scanRepository: IScanRepository,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {}

  async startScan(dto: StartScanDto): Promise<Scan> {
    this.logger.log(
      `Lancio scansione verso workspace ${dto.workspaceId}, repository ${dto.repositoryId}, branch ${dto.branch} `,
    );
    // TODO controllo appartenenza utente a ws
    const client = new ECSClient({
      region: this.configService.get<string>('CONTAINER_REGION')!,
    });
    const command = new RunTaskCommand({
      cluster: this.configService.get<string>('CONTAINER_CLUSTER')!,
      taskDefinition: this.configService.get<string>(
        'CONTAINER_TASK_DEFINITION',
      )!,
      launchType: 'FARGATE',
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: [
            this.configService.get<string>('CONTAINER_SUBNET_1')!,
            this.configService.get<string>('CONTAINER_SUBNET_2')!,
            this.configService.get<string>('CONTAINER_SUBNET_3')!,
          ],
          securityGroups: [
            this.configService.get<string>('CONTAINER_SECGROUP_1')!,
            this.configService.get<string>('CONTAINER_SECGROUP_2')!,
          ],
          assignPublicIp: 'ENABLED',
        },
      },
      count: 1,
    });

    const result = await client.send(command);
    // TODO gestione errori
    const handle = result.tasks!.at(0)!.taskArn!;
    this.logger.debug(`Handle: ${handle}`);
    const createScanDto: CreateScanDto = {
      ...dto,
      containerRef: handle, // da vedere connessione con aws
    };
    await this.scanRepository.create(createScanDto);
    // placeholder
    const scan: Scan = {
      id: 'scanId',
      workspaceId: dto.workspaceId,
      target: {
        repositoryId: dto.repositoryId,
        branchName: dto.branch,
      },

      startTime: new Date(),

      status: ScanStatus.Started,
      containerRef: 'this should not be here',
    };

    return scan;
  }

  async stopScan(dto: StopScanDto): Promise<void> {
    // TODO stop container e aggiornamento stato
    const scan = await this.scanRepository.find(dto);
    if (dto) {
      const client = new ECSClient({
        region: this.configService.get<string>('CONTAINER_REGION')!,
      });
      const commandInput: StopTaskCommandInput = {
        cluster: this.configService.get<string>('CONTAINER_CLUSTER'),
        task: scan?.containerRef,
      };
      this.logger.log(`Stopping: ${commandInput.task}`);
      await client.send(new StopTaskCommand(commandInput));
      this.logger.log(`Task stopped`);
    }
  }
}
