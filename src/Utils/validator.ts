import {logger} from './cli.js';
import {resolvePathOutput} from './directory.js';

export const VALIDATOR = {
  download: (input: string) => {
    if (!input) {
      console.log('\t');
      logger.warn('You need to pass the URL');
      return false;
    } else {
      return true;
    }
  },
  username: (input: string) => {
    if (!input) {
      console.log('\t');
      logger.warn('You need to pass the username');
      return false;
    } else {
      return true;
    }
  },
  path: (input: string) => {
    if (!input) {
      return true;
    }

    if (input === resolvePathOutput()) {
      return true;
    }

    const path = resolvePathOutput(input);
    if (!path) {
      return false;
    }
    return true;
  },
};
