import {TiktokStalk} from '@tobyg74/tiktok-api-dl';
import {StalkResult} from '@tobyg74/tiktok-api-dl/lib/types';
import {Cache} from './cache/utils.js';

export class SearchUser {
  #cache;
  search: (username: string) => Promise<StalkResult>;
  constructor() {
    this.search = this.Search;
    this.#cache = new Cache();
  }

  #setCache(key: string, value: any) {
    return this.#cache.set(key, value);
  }

  #getCache(key: string) {
    return this.#cache.get(key) as StalkResult | undefined;
  }

  private Search = (username: string): Promise<StalkResult> =>
    new Promise(async (resolve, reject) => {
      const data = this.#getCache(username) || (await TiktokStalk(username));

      if (data.status === 'error') {
        this.#setCache(username, data);
        resolve(data);
      }

      this.#setCache(username, data);

      resolve(data);
    });
}
