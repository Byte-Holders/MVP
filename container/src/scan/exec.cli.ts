import { Logger } from '@nestjs/common';
import { spawn, SpawnOptionsWithoutStdio } from 'child_process';

const logger = new Logger('ExecuteCli');

export type CliCommand = {
  name: string;
  args?: string[];
};

export async function executeCli(
  command: CliCommand,
  options?: SpawnOptionsWithoutStdio,
): Promise<string> {
  return new Promise(
    (resolve: (_: string) => void, reject: (_: Error) => void) => {
      logger.log(`${command.name} ${command.args?.join(' ')}`);

      const process = spawn(command.name, command.args, options);

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (out) => (stdout += out));
      process.stderr.on('data', (err) => (stderr += err));

      process.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(stderr));
        }
      });
    },
  );
}
