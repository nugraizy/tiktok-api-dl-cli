import axios from 'axios';
import progress from 'progress';
import fs from 'fs';
import {DownloadPost} from './download-post.js';
import {SearchUser} from './search-user.js';
import type {
  ParsingType,
  ParsingInput,
  PostResponse,
  UserResponse,
} from '../Types/Parsing';

export const insertAtIndex = (
  arr: string[],
  index: number,
  value: string
): string[] => {
  if (index < 0 || index > arr.length) {
    throw new Error('Index out of bounds');
  }
  return [...arr.slice(0, index), value, ...arr.slice(index)];
};

const formatNumber = (number: number) => {
  if (typeof number !== 'number') {
    throw new Error('Input must be a number');
  }

  if (number < 1000) {
    return String(number);
  }

  const units = ['K', 'M', 'B', 'T'];

  const unit = Math.floor((number.toFixed(0).length - 1) / 3) * 3;
  const value = (number / 10 ** unit).toFixed(1);

  return `${value}${units[unit / 3 - 1]}`;
};

export const _parse = async <T>(
  type: ParsingType,
  obj: T,
  {clientPost, clientUser}: {clientPost?: DownloadPost; clientUser?: SearchUser}
): Promise<UserResponse | PostResponse> => {
  if (type === 'user') {
    const {result} = obj as ParsingInput['user'];
    const caption = `
${result?.users.nickname} (@${result?.users.username}) ${
      result?.users.verified ? '✅' : '❎'
    }
👥 ${formatNumber(result?.stats.followerCount || 0)} · 👤 ${formatNumber(
      result?.stats.followingCount || 0
    )} · 💖 ${formatNumber(result?.stats.heartCount || 0)} · 🎬 ${formatNumber(
      result?.stats.videoCount || 0
    )}
${
  result?.users.signature ? `📄 ${result?.users.signature}\n` : ''
}https://tiktok.com/@${result?.users.username}
`;
    return {
      caption,
      fileName: `${result?.users.nickname} - @${result?.users.username}.jpg`,
      username: result?.users.username!,
      url: result?.users.avatar!,
    };
  } else {
    const {result} = obj as ParsingInput['post'];
    const {result: res} = await (clientUser as SearchUser).search(
      result?.author.username!
    );
    const caption = `
${result?.author.nickname} (@${result?.author.username}) ${
      res?.users.verified ? '✅' : '❎'
    }
👥 ${formatNumber(res?.stats.followerCount || 0)} · 👤 ${formatNumber(
      res?.stats.followingCount || 0
    )} · 💖 ${formatNumber(res?.stats.heartCount || 0)} · 🎬 ${formatNumber(
      res?.stats.videoCount || 0
    )}

👀 ${formatNumber(result?.statistics.play_count || 0)} · ❤️ ${formatNumber(
      result?.statistics.like_count || 0
    )} · 📥 ${formatNumber(
      result?.statistics.download_count || 0
    )}  · 🔄 ${formatNumber(
      result?.statistics.share_count || 0
    )} · 💬 ${formatNumber(result?.statistics.comment_count || 0)}
${result?.description ? `📄 ${result?.description}\n` : ''}
https://tiktok.com/@${res?.users.username}

Type ${result?.type === 'image' ? `📷 ${result.images?.length}` : `🎥`}
`;

    return {
      caption,
      fileName: `${result?.create_time} · ${res?.users.nickname} · @${
        res?.users.username
      }.${result?.type === 'image' ? 'jpg' : 'mp4'}`,
      fileNameImage: ` · ${res?.users.nickname} · @${res?.users.username}.jpg`,
      username: res?.users.username!,
      avatar: res?.users.avatar!,
      url: (result?.video?.[0] || result?.images)!,
    };
  }
};

const handleEventProgress = (data: any, progressBar: any) => {
  data.data.on('data', (chunk: Buffer) => {
    progressBar.tick(chunk.length);
  });
};

export const downloadFiles = async (
  urls: string | string[],
  fileName: string,
  dir: string,
  folderName: string
) => {
  console.log(dir);
  if (!fs.existsSync(`${dir}/@${folderName}`)) {
    fs.mkdirSync(`${dir}/@${folderName}`);
  }
  if (Array.isArray(urls)) {
    let stream;
    for (let i = 0, len = urls.length; i < len; i++) {
      const data = await axios({
        method: 'GET',
        url: urls[i],
        responseType: 'stream',
      });

      stream = data.data.pipe(
        fs.createWriteStream(`${dir}/@${folderName}/${i + 1} · ${fileName}`)
      );

      const totalLength = data.headers['content-length'];
      const progressBar = new progress(
        `Downloading [:bar] :percent :etas "${i + 1} · ${fileName}"`,
        {
          width: 40,
          complete: '=',
          incomplete: ' ',
          renderThrottle: 1,
          total: parseInt(totalLength),
        }
      );

      handleEventProgress(data, progressBar);
    }

    stream.on('finish', () => console.log('Download complete.'));
  } else {
    const data = await axios({
      method: 'GET',
      url: urls,
      responseType: 'stream',
    });

    data.data.pipe(fs.createWriteStream(`${dir}/@${folderName}/${fileName}`));

    const totalLength = data.headers['content-length'];
    const progressBar = new progress(
      `Downloading [:bar] :percent :etas "${fileName}"`,
      {
        width: 40,
        complete: '=',
        incomplete: ' ',
        renderThrottle: 1,
        total: parseInt(totalLength),
        callback: () => console.log('Download complete.'),
      }
    );

    handleEventProgress(data, progressBar);
  }
};

export const delay = async (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));
