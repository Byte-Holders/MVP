import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ISCAN_REPOSITORY_TOKEN,
  type IScanRepository,
} from '../interfaces/iscan.repository';
import {
  IScanManagerService,
  StartScanInfo,
} from './interfaces/iscan-manager.service';
import { Scan } from '../entities/scan.entity';
import { ScanStatus } from '../scan-status/enums/scan-status.enum';
import {
  ECSClient,
  RunTaskCommand,
  StopTaskCommand,
  StopTaskCommandInput,
} from '@aws-sdk/client-ecs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import {
  RepositoryReaderToken,
  type IRepositoryReader,
} from '../../repository/interfaces/repository.reader.interface';

@Injectable()
export class ScanManagerService implements IScanManagerService {
  private readonly logger = new Logger();

  constructor(
    @Inject(ISCAN_REPOSITORY_TOKEN)
    private readonly scanRepository: IScanRepository,
    @Inject(RepositoryReaderToken)
    private readonly repositoryReader: IRepositoryReader,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async startScan(info: StartScanInfo): Promise<Scan> {
    const [repository] = await this.repositoryReader.getRepositories([
      info.repositoryId,
    ]);
    const scanId = randomUUID();

    this.logger.log(
      `Lancio scansione ${scanId} verso ${repository.ownerName}/${repository.name}@${info.branch} `,
    );

    const failureCallback = this.configService
      .get<string>('SCAN_RECEIVER_URL_FAILURE')
      ?.replace('SCAN_ID', scanId);

    const callbackToken = await this.jwtService.signAsync({
      TARGET_OWNER: repository.ownerName,
      TARGET_REPOSITORY: repository.name,
      TARGET_BRANCH: info.branch,
      TARGET_ACCESS_TOKEN: repository.accessToken,
      RECEIVER_URL_SUCCESS: this.configService.get<string>(
        'SCAN_RECEIVER_URL_SUCCESS',
      )!,
      RECEIVER_URL_FAILURE: failureCallback!,
      repositoryId: info.repositoryId,
    });
    this.logger.debug(`Signed: ${callbackToken}`);

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
      overrides: {
        containerOverrides: [
          {
            name: 'scanner',
            environment: [
              { name: 'REPORT_CALLBACK_TOKEN', value: callbackToken },
            ],
          },
        ],
      },
      count: 1,
    });

    let handle: string;
    try {
      const result = await client.send(command);
      handle = result.tasks!.at(0)!.taskArn!;
    } catch (err) {
      this.logger.error(`Errore avvio container ECS: ${err}`);
      throw new InternalServerErrorException(
        `Impossibile avviare il container di scansione: ${err instanceof Error ? err.message : err}`,
      );
    }
    this.logger.debug(`Handle: ${handle}`);

    const scan: Scan = {
      id: scanId,
      workspaceId: info.workspaceId,
      target: {
        repositoryId: info.repositoryId,
        branchName: info.branch,
      },
      callbackToken,
      startTime: new Date(),
      status: ScanStatus.Started,
      containerRef: handle,
    };

    await this.scanRepository.create(scan);

    return scan;
  }

  async stopScan(scanId: string): Promise<void> {
    const scan = await this.scanRepository.find(scanId);
    if (!scan) {
      throw new NotFoundException(`Scan ${scanId} non trovato`);
    }
    if (scan.status != ScanStatus.Started) {
      throw new Error(`Scan ${scanId} non in corso.`);
    }

    const client = new ECSClient({
      region: this.configService.get<string>('CONTAINER_REGION')!,
    });
    const commandInput: StopTaskCommandInput = {
      cluster: this.configService.get<string>('CONTAINER_CLUSTER'),
      task: scan.containerRef,
    };
    this.logger.log(`Stopping: ${commandInput.task}`);
    await client.send(new StopTaskCommand(commandInput));
    this.logger.log(`Task stopped`);

    const updated: Scan = {
      ...scan,
      status: ScanStatus.Stopped,
    };

    await this.scanRepository.update(scanId, updated);
  }
}
