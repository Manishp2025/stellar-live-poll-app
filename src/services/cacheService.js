const CACHE_PREFIX = 'stellar_poll_';
const DEFAULT_EXPIRY = 60 * 1000; // 1 minute

export const cacheService = {
  set: (key, data, expiryMs = DEFAULT_EXPIRY) => {
    const item = {
      data,
      expiry: Date.now() + expiryMs,
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(item));
  },

  get: (key) => {
    const itemStr = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    return item.data;
  },

  remove: (key) => {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  },

  clear: () => {
    Object.keys(localStorage)
      .filter(key => key.startsWith(CACHE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }
};
