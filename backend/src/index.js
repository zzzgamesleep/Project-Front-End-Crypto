const express = require('express');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
dotenv.config();
const NodeCache = require('node-cache');
const myCache = new NodeCache();
const app = express();

const PORT = process.env.PORT || 4000;
const BASE_URL_BINANCE = process.env.BASE_URL_BINANCE || 'https://api.binance.com';
const BINANCE_TICKER_URL = `${BASE_URL_BINANCE}/api/v3/ticker/24hr`;
const BINANCE_EXCHANGE_INFO_URL = `${BASE_URL_BINANCE}/api/v3/exchangeInfo`;
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

const cache = new NodeCache({ stdTTL: 300 });

app.use(cors());

// Điều chỉnh rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Apply rate limiting to specific routes only
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per minute
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/coin/history', apiLimiter);
app.use('/api/coins/prices', apiLimiter);
app.use('/api/coin/candlestick', apiLimiter);

async function getCoinImageUrl(symbol) {
  const cacheKey = `image_${symbol}`;
  const cachedImage = cache.get(cacheKey);
  if (cachedImage) {
    return cachedImage;
  }

  try {
    const response = await axios.get(`${COINGECKO_API_URL}/search?query=${symbol}`, {
      timeout: 5000
    });
    const coin = response.data.coins.find(c => c.symbol.toLowerCase() === symbol.toLowerCase());
    const imageUrl = coin ? coin.large : null;

    if (imageUrl) {
      cache.set(cacheKey, imageUrl);
    }

    return imageUrl;
  } catch (error) {
    console.error(`Error fetching image for symbol: ${symbol}`, error.message);
    return null;
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Cập nhật API history để lấy từ đầu ngày
async function fetchWithRetry(url, params, retries = 3, delayMs = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, { params });
      return response;
    } catch (error) {
      if (error.response && error.response.status === 429) {
        // Rate limit exceeded, wait and retry
        await delay(delayMs);
      } else {
        throw error;
      }
    }
  }
  throw new Error('Failed to fetch data after multiple retries');
}

// Ví dụ sử dụng trong endpoint
app.get('/api/coin/history', async (req, res) => {
  try {
    const { symbol } = req.query;
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol parameter is required' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startTime = today.getTime();
    const endTime = Date.now();

    const cacheKey = `history_${symbol}_${startTime}`;
    const cachedData = myCache.get(cacheKey);
    if (cachedData) {
      return res.json({ history: cachedData });
    }

    const response = await fetchWithRetry(`${BASE_URL_BINANCE}/api/v3/klines`, {
      symbol: symbol.toUpperCase() + 'USDT',
      interval: '5m',
      startTime: startTime,
      endTime: endTime,
    });

    const historyData = response.data.map(item => ({
      time: new Date(item[0]).toISOString(),
      price: parseFloat(item[4]),
    }));

    myCache.set(cacheKey, historyData);

    res.json({ history: historyData });
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});


// New endpoint for searching coins
app.get('/api/search-coins', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const response = await axios.get(BASE_URL_BINANCE);
    const filteredCoins = response.data
      .filter(coin =>
        coin.symbol.toLowerCase().startsWith(query.toLowerCase()) ||
        coin.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 10) // Limit to 10 results
      .map(coin => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image
      }));

    res.json(filteredCoins);
  } catch (error) {
    console.error('Error searching coins:', error.message);
    res.status(500).json({ error: 'Failed to search coins' });
  }
});

// Endpoint for fetching current prices for multiple coins
app.get('/api/coins/prices', async (req, res) => {
  try {
    const { symbols } = req.query;
    if (!symbols) {
      return res.status(400).json({ error: 'Symbols parameter is required' });
    }

    const coinSymbols = symbols.split(',');
    const response = await axios.get(BINANCE_TICKER_URL);

    const filteredData = response.data
      .filter(coin => coinSymbols.includes(coin.symbol.replace('USDT', '')))
      .map(coin => ({
        symbol: coin.symbol.replace('USDT', ''),
        price: parseFloat(coin.lastPrice),
        percent_change_24h: parseFloat(coin.priceChangePercent),
        last_updated: new Date().toISOString(),
      }));

    res.json(filteredData);
  } catch (error) {
    console.error('Error fetching current prices:', error.message);
    res.status(500).json({ error: 'Failed to fetch current prices' });
  }
});

// Endpoint for fetching top 10 volume coins
app.get('/api/top-10-volume', async (req, res) => {
  try {
    // console.log('Fetching data from Binance APIs...');

    const [tickerResponse, exchangeInfoResponse] = await Promise.all([
      axios.get(BINANCE_TICKER_URL),
      axios.get(BINANCE_EXCHANGE_INFO_URL)
    ]);

    // console.log('Data fetched successfully. Processing...');

    const symbolInfo = {};
    exchangeInfoResponse.data.symbols.forEach(symbol => {
      if (symbol.symbol.endsWith('USDT')) {
        symbolInfo[symbol.symbol] = {
          baseAsset: symbol.baseAsset,
          name: symbol.baseAsset,
        };
      }
    });

    const topCoins = tickerResponse.data
      .filter(coin => coin.symbol.endsWith('USDT'))
      .sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume))
      .slice(0, 10);

    const coinPromises = topCoins.map(async (coin, index) => {
      const info = symbolInfo[coin.symbol] || {};
      const symbol = info.baseAsset || coin.symbol.replace('USDT', '');

      let image = await getCoinImageUrl(symbol);

      return {
        rank: index + 1,
        symbol: symbol,
        name: info.name || symbol,
        image: image || 'https://via.placeholder.com/30',
        current_price: parseFloat(coin.lastPrice),
        high_24h: parseFloat(coin.highPrice),
        low_24h: parseFloat(coin.lowPrice),
        total_volume: parseFloat(coin.volume)
      };
    });

    const resolvedTopCoins = await Promise.all(coinPromises);

    console.log(`Processed ${resolvedTopCoins.length} coins successfully.`);
    res.json(resolvedTopCoins);
  } catch (error) {
    console.error('Error in fetching top 10 volume coins:', error);
    res.status(500).json({ error: 'Failed to fetch top 10 volume coins' });
  }
});
// New endpoint for fetching candlestick data with custom time range
app.get('/api/coin/candlestick', async (req, res) => {
  try {
    const { symbol, start, end, interval } = req.query;
    if (!symbol || !start || !end || !interval) {
      return res.status(400).json({ error: 'Symbol, start, end, and interval parameters are required' });
    }

    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    const response = await axios.get(`${BASE_URL_BINANCE}/api/v3/klines`, {
      params: {
        symbol: symbol.toUpperCase() + 'USDT',
        interval: interval,
        startTime: startTime,
        endTime: endTime,
      },
    });

    const candlestickData = response.data.map(item => ({
      time: new Date(item[0]).toISOString(),
      open: parseFloat(item[1]),
      high: parseFloat(item[2]),
      low: parseFloat(item[3]),
      close: parseFloat(item[4]),
      volume: parseFloat(item[5]),
    }));

    res.json({ candlestick: candlestickData });
  } catch (error) {
    console.error('Error fetching candlestick data:', error.message);
    res.status(500).json({ error: 'Failed to fetch candlestick data' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});