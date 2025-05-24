const axios = require('axios');

const NEWS_API_BASE = 'https://newsapi.org/v2';
const NEWS_API_KEY = process.env.NEWS_API_KEY;

if (!NEWS_API_KEY) {
    console.warn('Warning: API_NEWS_KEY is not set in environment variables');
}

const newsClient = axios.get({
    baseURL: NEWS_API_BASE,
    headers: {
        'Authorization': `Bearer ${NEWS_API_KEY}`
    },
});

/**
 * Fetch top headlines or search articles
 * @param {Object} options { q, category, country, pageSize, page }
 */
async function fetchNews(options = {}) {
    const params = { pageSize: options.pageSize || 10, page: options.page || 1 };
    if (options.q) params.q = options.q;
    if (options.category) params.category = options.category;
    if (options.country) params.country = options.country;

    const response = await newsClient.get('/top-headlines', { params });
    return response.data;
}

module.exports = {
    fetchNews
};