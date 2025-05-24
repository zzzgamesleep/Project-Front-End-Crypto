const express = require('express');
const router = express.Router();
const { fetchWithRetry } = require('../services/binanceService');
const { myCache } = require('../utils/cache');

router.get('/', async (req, res) => {
  try {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Symbol parameter is required' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startTime = today.getTime();
    const endTime = Date.now();
    const cacheKey = `history_${symbol}_${startTime}`;
    const cached = myCache.get(cacheKey);
    if (cached) return res.json({ history: cached });

    const response = await fetchWithRetry('/klines', {
      symbol: symbol.toUpperCase() + 'USDT',
      interval: '5m',
      startTime,
      endTime,
    });

    const historyData = response.data.map(item => ({
      time: new Date(item[0]).toISOString(),
      price: parseFloat(item[4]),
    }));

    myCache.set(cacheKey, historyData);
    res.json({ history: historyData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

module.exports = router;
