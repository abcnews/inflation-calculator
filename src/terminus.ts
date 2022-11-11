import { fetchOne } from '@abcnews/terminus-fetch';

const API_KEY = 'niste6c8345c6b3a6420a545b09f31b3';

const cache = {};

export const fetchDocument = optionsOrId => {
  const options = typeof optionsOrId === 'object' ? optionsOrId : { id: optionsOrId };
  const key = options.id;

  if (!cache[key]) {
    cache[key] = fetchOne({ apikey: API_KEY, ...options });
  }

  return cache[key];
};
