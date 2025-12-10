const tokensRouter = require('express').Router();
const jwtConfig = require('../config/jwtConfig');
const verifyRefreshToken = require('../middleware/verifyRefreshToken');
const generateTokens = require('../utils/generateTokens');

tokensRouter.get('/refresh', verifyRefreshToken, (req, res) => {
  const { user } = res.locals;

  const { accessToken, refreshToken } = generateTokens({ user });
  res
    .cookie(jwtConfig.refresh.type, refreshToken, {
      httpOnly: true,
      maxAge: jwtConfig.refresh.expiresInMs,
      sameSite: 'lax',
      secure: false,
    })
    .json({ user, accessToken });
});

module.exports = tokensRouter;
