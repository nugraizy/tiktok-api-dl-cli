import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: 60 * 60 * 1000,
  deleteOnExpire: true,
});

export class Cache {
  set: typeof setCache;
  get: typeof getCache;
  flush: typeof flushCache;
  constructor() {
    this.set = setCache;
    this.get = getCache;
    this.flush = flushCache;
  }
}

const setCache = (key: string, value: any) => cache.set(key, value);
const getCache = (key: string) => cache.get(key);
const flushCache = () => cache.flushAll();
