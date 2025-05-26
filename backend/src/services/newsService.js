const axios = require("axios");
require("dotenv").config(); // Ensure dotenv is configured early

const NEWS_API_BASE = "https://newsapi.org/v2";
const NEWS_API_KEY = process.env.NEWS_API_KEY;

if (!NEWS_API_KEY) {
    console.warn("Warning: NEWS_API_KEY is not set in environment variables. News API calls will likely fail.");
}

// Correctly create an Axios instance
const newsClient = axios.create({
    baseURL: NEWS_API_BASE,
    headers: {
        // Use Authorization header for NewsAPI key
        "Authorization": `Bearer ${NEWS_API_KEY}`
        // Alternatively, some APIs use X-Api-Key
        // "X-Api-Key": NEWS_API_KEY 
    },
    timeout: 10000 // Add a timeout for requests
});

/**
 * Fetch top headlines or search articles from NewsAPI
 * @param {Object} options - Query parameters { q, category, country, pageSize, page }
 * @returns {Promise<Object>} - The data part of the Axios response
 * @throws {Error} - Throws error if the request fails
 */
async function fetchNews(options = {}) {
    const params = { 
        pageSize: options.pageSize || 10, 
        page: options.page || 1, 
        country: options.country || "us" // Default country if not provided
    };
    if (options.q) params.q = options.q;
    if (options.category) params.category = options.category;
    
    // Determine the endpoint based on whether a query or category is provided
    const endpoint = (options.q || options.category) ? "/everything" : "/top-headlines";

    try {
        // Make the GET request using the created Axios instance
        const response = await newsClient.get(endpoint, { params });
        return response.data; // Return the data from the response
    } catch (error) {
        console.error(`Error fetching news from NewsAPI (Endpoint: ${endpoint}):`, error.response?.data || error.message);
        // Re-throw the error or return a specific error structure
        throw new Error(`Failed to fetch news: ${error.response?.data?.message || error.message}`);
    }
}

module.exports = {
    fetchNews
};