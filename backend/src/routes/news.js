const express = require('express');
const router = express.Router();
const { fetchNews } = require('../services/newsService');

router.get('/', async (req, res) => {
  try {
    // Accept q (keyword), category, country, pageSize, page
    const options = {
      q: req.query.q,
      category: req.query.category,
      country: req.query.country,
      pageSize: parseInt(req.query.pageSize, 10) || 10,
      page: parseInt(req.query.page, 10) || 1,
    };

    const newsData = await fetchNews(options);
    res.json({ totalResults: newsData.totalResults, articles: newsData.articles });
  } catch (err) {
    console.error('Error fetching news:', err.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

module.exports = router;
