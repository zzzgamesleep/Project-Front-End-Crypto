const NodeCache = require('node-cache');
const myCache = new NodeCache();
const cache = new NodeCache({ stdTTL: 300 });

module.exports = { myCache, cache };
