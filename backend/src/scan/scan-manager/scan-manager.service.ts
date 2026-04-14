import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
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
    this.logger.log(
      `Lancio scansione verso workspace ${info.workspaceId}, repository ${info.repositoryId}, branch ${info.branch} `,
    );

    const [repository] = await this.repositoryReader.getRepositories([
      info.repositoryId,
    ]);
    const scanId = randomUUID();

    this.logger.log(
      `Lancio scansione ${scanId} verso ${repository.ownerName}/${repository.name}@${info.branch} `,
    );

    const callbackToken = await this.jwtService.signAsync({
      TARGET_OWNER: repository.ownerName,
      TARGET_REPOSITORY: repository.name,
      TARGET_BRANCH: info.branch,
      RECEIVER_URL_SUCCESS: this.configService.get<string>(
        'SCAN_RECEIVER_URL_SUCCESS',
      )!,
      RECEIVER_URL_FAILURE: this.configService.get<string>(
        'SCAN_RECEIVER_URL_FAILURE',
      ),
      AWS_ACCESS_KEY_ID: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
      AWS_SECRET_ACCESS_KEY: this.configService.get<string>(
        'AWS_SECRET_ACCESS_KEY',
      )!,
      AWS_SESSION_TOKEN: this.configService.get<string>('AWS_SESSION_TOKEN')!,
      AWS_BEARER_TOKEN_BEDROCK: this.configService.get<string>(
        'AWS_BEARER_TOKEN_BEDROCK',
      )!,
      repositoryId: info.repositoryId,
    });

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

    // TODO gestione errori
    const result = await client.send(command);
    const handle = result.tasks!.at(0)!.taskArn!;
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
    const scan = await this.scanRepository.find(scanId); // TODO id
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
      task: scan?.containerRef,
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
