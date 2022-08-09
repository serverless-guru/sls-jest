import { spawn } from 'child_process';
import { resolve } from 'path';

export const deploy = () =>
  new Promise((ok, reject) => {
    const child = spawn(
      'cdk',
      ['deploy', 'SlsJestStack', '--require-approval', 'never'],
      {
        stdio: 'inherit',
        cwd: resolve(__dirname, '..'),
      },
    );

    child.on('close', (code) => {
      ok(code);
    });

    child.on('error', (err) => {
      reject(err);
    });
  });

export const destroy = () =>
  new Promise((ok, reject) => {
    const child = spawn(
      'cdk',
      ['destroy', 'SlsJestStack', '--force'],
      {
        stdio: 'inherit',
        cwd: resolve(__dirname, '..'),
      },
    );

    child.on('close', (code) => {
      ok(code);
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
