const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const { generalLimiter, apiLimiter } = require('./middlewares/rateLimiter');
const coinHistoryRoute = require('./routes/coinHistory');
const coinsPricesRoute = require('./routes/coinsPrices');
const candlestickRoute = require('./routes/coinCandlestick');
const searchCoinsRoute = require('./routes/searchCoins');
const top10VolumeRoute = require('./routes/top10Volume');
const newsRoute = require('./routes/news');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

app.use('/api/coin/history', apiLimiter, coinHistoryRoute);
app.use('/api/coins/prices', apiLimiter, coinsPricesRoute);
app.use('/api/coin/candlestick', apiLimiter, candlestickRoute);
app.use('/api/search-coins', apiLimiter, searchCoinsRoute);
app.use('/api/top-10-volume', apiLimiter, top10VolumeRoute);
app.use('/api/news', apiLimiter, newsRoute);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
