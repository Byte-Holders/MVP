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
    const command: CliCommand = {
      name: 'sh',
      args: [
        '-c',
        `cd "${targetPath}" && npm install --silent && (npx jest --no-colors --coverage --coverageReporters="text-summary" --json --outputFile="${resultsPath}" 2>&1; true)`,
      ],
    };
    const stdout = await executeCli(command);
    return { stdout, resultsPath };
  }

  checkFileExists(filePath: string) {
    return fs.existsSync(filePath);
  }

  getFileContentsRaw(resultsPath: string): string {
    return fs.readFileSync(resultsPath, 'utf-8');
  }
}
