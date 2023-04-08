import {TiktokDL} from '@tobyg74/tiktok-api-dl';
import {DLResult} from '@tobyg74/tiktok-api-dl/lib/types';
import {Cache} from './cache/utils.js';

export class DownloadPost {
  #cache;
  download: (url: string) => Promise<DLResult>;
  constructor() {
    this.download = this.Download;
    this.#cache = new Cache();
  }

  #setCache(key: string, value: any) {
    return this.#cache.set(key, value);
  }

  #getCache(key: string) {
    return this.#cache.get(key) as DLResult | undefined;
  }

  private Download = (url: string): Promise<DLResult> =>
    new Promise(async (resolve, reject) => {
      const data = this.#getCache(url) || (await TiktokDL(url));

      if (data.status === 'error') {
        this.#setCache(url, data);
        resolve(data);
      }

      this.#setCache(url, data);

      resolve(data);
    });
}
