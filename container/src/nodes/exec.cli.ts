import { spawn } from 'child_process';

export async function executeCli(
  command: string,
  ...args: string[]
): Promise<string> {
  return new Promise(
    (resolve: (_: string) => void, reject: (_: Error) => void) => {
      console.log(`RUNNING COMMAND: ${command} ${args.join(' ')}`);

      const process = spawn(command, args);

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
