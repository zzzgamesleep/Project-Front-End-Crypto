const axios = require('axios');
const { delay } = require('../utils/delay');

const BASE_URL_BINANCE = process.env.BASE_URL_BINANCE || 'https://api.binance.com';
const binance = axios.create({ baseURL: BASE_URL_BINANCE });

async function fetchWithRetry(endpoint, params, retries = 3, delayMs = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await binance.get(`/api/v3${endpoint}`, { params });
    } catch (error) {
      if (error.response?.status === 429) await delay(delayMs);
      else throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

module.exports = {
  fetchWithRetry,
  binance
};
