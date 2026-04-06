import { Injectable } from '@nestjs/common';
import path from 'path';
import fs from 'fs';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import { Target } from '../../target.types';

@Injectable()
export class OrchestratorHelper {
  async cloneRepo(target: Target): Promise<string> {
    const url = `https://github.com/${target.owner}/${target.repository}.git`;

    console.log(`Ricevuto: ${url}`);

    const repoName = target.repository;
    const clonePath = path.join(
      process.env.REPOS_ROOT ?? '/usr/src/repos',
      repoName,
    );

    console.log(`Esecuzione git clone in ${clonePath}`);

    // Se la cartella esiste già, non clonare di nuovo
    if (fs.existsSync(clonePath)) {
      console.log('Repo già presente localmente.');
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

    console.log(`Repo clonata con successo in ${clonePath}`);
    return clonePath;
  }
}
