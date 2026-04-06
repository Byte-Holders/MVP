import { spawn, SpawnOptionsWithoutStdio } from 'child_process';

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
      console.log(
        `RUNNING COMMAND: ${command.name} ${command.args?.join(' ')}`,
      );

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
