// ./config/jwtConfig.js
const jwtConfig = {
    access: {
      type: 'accessToken',
      expiresIn: '5m', // 5 минут в формате для jwt
      expiresInMs: 1000 * 60 * 5, // 5 минут в миллисекундах для cookies
    },
    refresh: {
      type: 'refreshToken',
      expiresIn: '12h', // 12 часов в формате для jwt
      expiresInMs: 1000 * 60 * 60 * 12, // 12 часов в миллисекундах для cookies
    },
};
   
module.exports = jwtConfig;