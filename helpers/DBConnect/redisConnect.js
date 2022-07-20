const redis = require('redis');

const redisClient = redis.createClient({
   // host: 'localhost',
   // port: 6739,
   url: process.env.DB_REDIS_HOST
});

redisClient.on('error', (err) => {
   console.log('Redis connect error::', err.message);
});

redisClient.on('connect', () => {
   console.log('Redis connected');
});

redisClient.on('ready', () => {
   console.log('Redis ready');
});

module.exports = redisClient;