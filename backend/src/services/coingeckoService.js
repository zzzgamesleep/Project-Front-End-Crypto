const axios = require('axios');
const { cache } = require('../utils/cache');

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

async function getCoinImageUrl(symbol) {
  const cacheKey = `image_${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const res = await axios.get(`${COINGECKO_API_URL}/search`, {
      params: { query: symbol },
      timeout: 5000
    });

    const coin = res.data.coins.find(c => c.symbol.toLowerCase() === symbol.toLowerCase());
    const imageUrl = coin?.large || null;
    if (imageUrl) cache.set(cacheKey, imageUrl);
    return imageUrl;
  } catch (e) {
    return null;
  }
}

module.exports = {
  getCoinImageUrl
};