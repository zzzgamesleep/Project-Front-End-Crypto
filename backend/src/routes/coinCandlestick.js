const express = require('express');
const router = express.Router();
const { fetchWithRetry } = require('../services/binanceService');

router.get('/', async (req, res) => {
  try {
    const { symbol, start, end, interval } = req.query;
    if (!symbol || !start || !end || !interval) {
      return res.status(400).json({ error: 'Symbol, start, end, and interval parameters are required' });
    }

    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    const response = await fetchWithRetry('/klines', {
      symbol: symbol.toUpperCase() + 'USDT',
      interval,
      startTime,
      endTime,
    });

    const candlestick = response.data.map(item => ({
      time: new Date(item[0]).toISOString(),
      open: parseFloat(item[1]),
      high: parseFloat(item[2]),
      low: parseFloat(item[3]),
      close: parseFloat(item[4]),
      volume: parseFloat(item[5]),
    }));

    res.json({ candlestick });
  } catch (err) {
    console.error('Error fetching candlestick data:', err.message);
    res.status(500).json({ error: 'Failed to fetch candlestick data' });
  }
});

module.exports = router;