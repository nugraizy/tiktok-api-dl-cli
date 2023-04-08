import {DownloadPost} from './Utils/download-post.js';
import {SearchUser} from './Utils/search-user.js';
import {delay, downloadFiles, insertAtIndex} from './Utils/modules.js';
import {askOptions, askQuestions, logger} from './Utils/cli.js';
import {VALIDATOR} from './Utils/validator.js';

const clientUser = new SearchUser();
const clientPost = new DownloadPost();
let downloadPath: string | null;
const DEFAULT_OPTIONS_ACT = ['User', 'Post', 'Exit'];

export const main = async () => {
  try {
    const options = await askOptions(
      downloadPath
        ? insertAtIndex(DEFAULT_OPTIONS_ACT, 2, 'Path')
        : DEFAULT_OPTIONS_ACT,
      'Choose options'
    );

    if (options === 'Exit') {
      process.exit(0);
    }

    if (options === 'Path') {
      downloadPath = null;
    }

    if (!downloadPath) {
      downloadPath = await askQuestions(
        'path',
        'Where would you like the output file to be saved?',
        {},
        VALIDATOR.path
      );
    }

    if (options === 'User') {
      const response = await askQuestions(
        'user',
        'Type TikTok username :',
        {clientUser, main},
        VALIDATOR.username
      );

      console.log(response.caption);

      const options = await askOptions(
        ['Yes', 'No', 'Exit'],
        'Do you want to download the avatar?'
      );

      if (options === 'Yes') {
        logger.info('Downloading Avatar');
        await downloadFiles(
          response.url,
          response.fileName,
          downloadPath!,
          response.username
        );
        await delay(1000);
      }
    } else if (options === 'Post') {
      const response = await askQuestions(
        'post',
        'Paste TikTok URL :',
        {clientPost, clientUser, main},
        VALIDATOR.download
      );

      console.log(response.caption);

      const options = await askOptions(
        ['Yes', 'No', 'Exit'],
        'Do you want to download the avatar?'
      );

      if (options === 'Yes') {
        logger.info('Downloading Avatar');
        await downloadFiles(
          response.avatar,
          'avatar' + response.fileNameImage,
          downloadPath!,
          response.username
        );
        await delay(1000);
      }

      logger.info('Downloading Media');
      await downloadFiles(
        response.url,
        response.fileName,
        downloadPath!,
        response.username
      );

      await delay(2000);
    }

    await main();
  } catch (error) {
    console.log(error);
    process.exit(0);
  }
};

await main();
