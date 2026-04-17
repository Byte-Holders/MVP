import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { CliCommand, executeCli } from '../../../exec.cli';

@Injectable()
export class CoverageNodeHelper {
  async runCoverageTool(
    targetPath: string,
  ): Promise<{ stdout: string; resultsPath: string }> {
    const resultsPath = path.join(
      os.tmpdir(),
      `jest-results-${Date.now()}.json`,
    );
    const jestCommand = this.buildJestCommand(targetPath, resultsPath);
    const command: CliCommand = {
      name: 'sh',
      args: [
        '-c',
        `cd "${targetPath}" && npm install --silent --ignore-scripts && ${jestCommand}`,
      ],
    };
    const stdout = await executeCli(command);
    return { stdout, resultsPath };
  }

  private buildJestCommand(targetPath: string, resultsPath: string): string {
    try {
      const pkgPath = path.join(targetPath, 'package.json');
      const pkg = JSON.parse(this.getFileContentsRaw(pkgPath)) as {
        scripts?: { test?: string };
      };
      if (pkg.scripts?.test?.startsWith('react-scripts test')) {
        return `(CI=true npx react-scripts test --coverage --coverageReporters="text-summary" --json --outputFile="${resultsPath}" 2>&1; true)`;
      }
    } catch {
      // fall through to default
    }
    return `(npx jest --no-colors --coverage --coverageReporters="text-summary" --json --outputFile="${resultsPath}" 2>&1; true)`;
  }

  checkFileExists(filePath: string) {
    return fs.existsSync(filePath);
  }

  getFileContentsRaw(resultsPath: string): string {
    return fs.readFileSync(resultsPath, 'utf-8');
  }
}
