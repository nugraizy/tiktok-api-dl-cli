import * as path from 'path';
import os from 'os';
import {existsSync} from 'fs';

export const resolvePathOutput = (outputDir?: string): string | null => {
  const cwd = process.cwd();
  const homedir = os.homedir();
  let outputPath: string;

  if (
    outputDir?.startsWith('./') ||
    outputDir?.startsWith('../') ||
    outputDir === '.'
  ) {
    outputPath = path.join(cwd, outputDir);
  } else if (outputDir?.startsWith('~/')) {
    outputPath = path.join(homedir, outputDir.slice(2));
  } else if (!outputDir) {
    outputPath = path.resolve(homedir, cwd);
  } else {
    outputPath = path.join(cwd, outputDir!);
  }

  outputPath = path.normalize(outputPath);

  if (!existsSync(outputPath)) {
    return null;
  }

  return outputPath;
};
