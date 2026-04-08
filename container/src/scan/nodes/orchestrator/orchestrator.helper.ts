import { Injectable, Logger } from '@nestjs/common';
import path from 'path';
import fs from 'fs';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import { Target } from '../../target.types';

@Injectable()
export class OrchestratorHelper {
  private readonly logger = new Logger(OrchestratorHelper.name);

  async cloneRepo(target: Target): Promise<string> {
    const url = `https://github.com/${target.owner}/${target.repository}.git`;

    const repoName = target.repository;
    const clonePath = path.join(
      process.env.REPOS_ROOT ?? '/usr/src/repos',
      repoName,
    );

    this.logger.debug(`Esecuzione \`git clone\` di ${url} in ${clonePath}`);

    // Se la cartella esiste già, non clonare di nuovo
    if (fs.existsSync(clonePath)) {
      this.logger.log('Repo già presente localmente.');
      return clonePath;
    }

    await git.clone({
      http,
      fs,
      dir: clonePath,
      url,
      singleBranch: true,
      depth: 1,
      ref: target.branch,
    });

    this.logger.debug(`Repo clonata con successo in ${clonePath}`);
    return clonePath;
  }
}
