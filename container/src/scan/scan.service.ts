import { Injectable, Logger } from '@nestjs/common';
import { OrchestratorService } from './nodes/orchestrator/orchestrator.service';
import { Target } from './target.types';
import {
  IScanService,
  RepositoryConnectionInfo,
} from './iscan-service.interface';
import axios from 'axios';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';

@Injectable()
export class ScanService implements IScanService {
  constructor(private readonly orchestratorService: OrchestratorService) {}

  async scan(target: Target) {
    const logger = new Logger(ScanService.name);

    logger.log(
      `Lancio scansione verso ${target.owner}/${target.repository}@${target.branch}`,
    );
    return await this.orchestratorService.execute(target);
  }

  async validateBedrockAccess(bearerToken: string | undefined): Promise<void> {
    if (!bearerToken)
      throw new Error('Nessuna Bedrock Bearer token riconosciuta');

    const axiosInstance = axios.create({
      baseURL: 'https://bedrock.eu-north-1.amazonaws.com',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    try {
      await axiosInstance.get('/foundation-models');
    } catch {
      throw new Error(`Bedrock bearer token non valida: ${bearerToken}`);
    }
  }

  async validateGithubAccess(
    connectionInfo: RepositoryConnectionInfo,
  ): Promise<void> {
    if (
      !connectionInfo.owner ||
      !connectionInfo.repository ||
      !connectionInfo.branch
    ) {
      throw new Error(
        `Mancano informazioni sul bersaglio delle scansioni scansioni.
        Owner: ${connectionInfo.owner}
        Repository: ${connectionInfo.repository}
        Branch: ${connectionInfo.branch}`,
      );
    }

    const url = `https://github.com/${connectionInfo.owner}/${connectionInfo.repository}`;
    try {
      await git.getRemoteInfo({
        url,
        http,
        onAuth: () => ({
          username: 'token',
          password: connectionInfo.accessToken,
        }),
      });
    } catch (e: unknown) {
      throw new Error(
        `Errore durante la connessione con github: ${(e as Error).message}`,
      );
    }
  }
}
