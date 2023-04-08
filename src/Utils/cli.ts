import inquirer from 'inquirer';
import winston from 'winston';
import {resolvePathOutput} from './directory.js';
import {DownloadPost} from './download-post.js';
import {SearchUser} from './search-user.js';
import {_parse} from './modules.js';
import type {PostResponse, UserResponse} from '../Types/Parsing.js';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
    winston.format.padLevels(),
    winston.format.timestamp(),
    winston.format.printf(({level, message, timestamp}) => {
      return `${timestamp}  ${level}: ${message?.trim()}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: './src/Logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: './src/Logs/info.log',
      level: 'info',
    }),
  ],
});

export const askQuestions = async (
  type: 'user' | 'post' | 'path',
  question: string,
  {
    clientPost,
    clientUser,
    main,
  }: {
    clientPost?: DownloadPost;
    clientUser?: SearchUser;
    main?: () => Promise<void>;
  },
  validator?: (input: any, answer?: any) => boolean | string
) => {
  if (type === 'user') {
    const {answer} = await inquirer.prompt([
      {
        name: 'answer',
        message: question,
        type: 'input',
        ...(validator ? {validate: validator} : {}),
      },
    ]);

    logger.info('Searching ' + answer);

    const data = await clientUser?.search(answer);

    if (!data) {
      logger.error(answer + ' Not found.');
      await main?.();
    }

    const caption = (await _parse('user', data, {clientUser})) as UserResponse;

    return caption;
  } else if (type === 'post') {
    const {answer} = await inquirer.prompt([
      {
        name: 'answer',
        message: question,
        type: 'input',
        ...(validator ? {validate: validator} : {}),
      },
    ]);

    logger.info('Scraping ' + answer);

    const data = await clientPost?.download(answer);

    if (!data) {
      logger.error(answer + ' Not found.');
      await main?.();
    }

    const caption = (await _parse('post', data, {
      clientUser,
      clientPost,
    })) as PostResponse;

    return caption;
  } else if (type === 'path') {
    const defaultPath = resolvePathOutput();
    let {answer} = await inquirer.prompt([
      {
        name: 'answer',
        message: question,
        type: 'input',
        default: defaultPath,
        ...(validator ? {validate: validator} : {}),
      },
    ]);

    if (answer !== defaultPath) {
      answer = resolvePathOutput(answer);
    }

    return answer;
  }
};

export const askOptions = async (
  choices: string[],
  message: string
): Promise<'Yes' | 'No' | 'User' | 'Post' | 'Path' | 'Exit'> => {
  const {options} = await inquirer.prompt([
    {
      name: 'options',
      message,
      type: 'list',
      choices,
    },
  ]);

  if (options === 'Exit') {
    process.exit(0);
  }

  return options;
};
