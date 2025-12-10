// ./middleware/verifyRefreshToken.js
const { User } = require('../../db/models');
require('dotenv').config();
const jwt = require('jsonwebtoken');

async function verifyRefreshToken(req, res, next) {
  try {
    const { refreshToken } = req.cookies;
    const { user } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const currentUser = await User.findByPk(user.id);

    res.locals.user = currentUser.get();

    next();
  } catch (error) {
    console.log('Invalid refresh token');
    res.clearCookie('refreshToken').sendStatus(401);
  }
}

module.exports = verifyRefreshToken;
