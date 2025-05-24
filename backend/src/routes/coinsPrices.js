const express = require('express');
const router = express.Router();
const { binance } = require('../services/binanceService');

router.get('/', async (req, res) => {
  try {
    const { symbols } = req.query;
    if (!symbols) return res.status(400).json({ error: 'Symbols parameter is required' });

    const coinSymbols = symbols.split(',').map(s => s.toUpperCase());
    const response = await binance.get('/api/v3/ticker/24hr');

    const filtered = response.data
      .filter(c => coinSymbols.includes(c.symbol.replace('USDT', '')))
      .map(c => ({
        symbol: c.symbol.replace('USDT', ''),
        price: parseFloat(c.lastPrice),
        percent_change_24h: parseFloat(c.priceChangePercent),
        last_updated: new Date().toISOString(),
      }));

    res.json(filtered);
  } catch (err) {
    console.error('Error fetching current prices:', err.message);
    res.status(500).json({ error: 'Failed to fetch current prices' });
  }
});

module.exports = router;
