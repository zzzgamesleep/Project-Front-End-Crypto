const express = require('express');
const router = express.Router();
const { binance } = require('../services/binanceService');

router.get('/', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Query parameter is required' });

    // Fetch exchange info once
    const resp = await binance.get('/api/v3/exchangeInfo');
    const symbols = resp.data.symbols
      .filter(s => s.symbol.endsWith('USDT'))
      .map(s => ({ symbol: s.symbol, base: s.baseAsset }));

    const results = symbols
      .filter(c =>
        c.base.toLowerCase().startsWith(query.toLowerCase()) ||
        c.symbol.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 10)
      .map(c => ({ symbol: c.base, name: c.base, image: null }));

    res.json(results);
  } catch (err) {
    console.error('Error searching coins:', err.message);
    res.status(500).json({ error: 'Failed to search coins' });
  }
});

module.exports = router;
