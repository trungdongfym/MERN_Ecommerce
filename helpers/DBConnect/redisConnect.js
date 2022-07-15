const redis = require('redis');

const redisClient = redis.createClient({
   host: 'localhost',
   port: 6739
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