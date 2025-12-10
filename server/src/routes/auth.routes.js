const { signUp, signIn, logout, refreshToken } = require('../controllers/authController');
const verifyRefreshToken = require('../middleware/verifyRefreshToken');

const authRouter = require('express').Router();

authRouter.post('/signup', signUp);
authRouter.post('/signin', signIn);
authRouter.delete('/logout', logout);
authRouter.post('/refresh', verifyRefreshToken, refreshToken);

module.exports = authRouter;
