const express = require('express');
const router = express.Router();
const { binance } = require('../services/binanceService');
const { getCoinImageUrl } = require('../services/coingeckoService');

router.get('/', async (req, res) => {
  try {
    const [tickResp, infoResp] = await Promise.all([
      binance.get('/api/v3/ticker/24hr'),
      binance.get('/api/v3/exchangeInfo')
    ]);

    const symbolInfo = {};
    infoResp.data.symbols.forEach(s => {
      if (s.symbol.endsWith('USDT')) symbolInfo[s.symbol] = s.baseAsset;
    });

    const top = tickResp.data
      .filter(c => c.symbol.endsWith('USDT'))
      .sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume))
      .slice(0, 10);

    const output = await Promise.all(top.map(async (c, idx) => {
      const base = symbolInfo[c.symbol] || c.symbol.replace('USDT', '');
      const img = await getCoinImageUrl(base);
      return {
        rank: idx + 1,
        symbol: base,
        name: base,
        image: img || 'https://via.placeholder.com/30',
        current_price: parseFloat(c.lastPrice),
        high_24h: parseFloat(c.highPrice),
        low_24h: parseFloat(c.lowPrice),
        total_volume: parseFloat(c.volume)
      };
    }));

    res.json(output);
  } catch (err) {
    console.error('Error fetching top 10 volume coins:', err);
    res.status(500).json({ error: 'Failed to fetch top 10 volume coins' });
  }
});

module.exports = router;