const {
  updateUser,
  getAllUsers,
  getUserById,
  updateAvatarUser,
  getCurrentUser,
  refreshUserToken,
} = require('../controllers/userController');

const verifyAccessToken = require('../middleware/verifyAccessToken');
const { upload } = require('../utils/upload');
const userRouter = require('express').Router();

userRouter
  .put('/avatar', verifyAccessToken, upload.single('avatar'), updateAvatarUser)
  .put('/', verifyAccessToken, updateUser)
  .post('/refresh-token', verifyAccessToken, refreshUserToken)
  .get('/', getAllUsers)
  .get('/me', verifyAccessToken, getCurrentUser);

userRouter.put('/:id', verifyAccessToken, updateUser);

// Публичный endpoint для получения профиля пользователя (без авторизации)
userRouter.get('/profile/:id', require('../controllers/userController').getUserById);

userRouter.get('/:id', verifyAccessToken, async (req, res, next) => {
  // Проверяем, совпадает ли id из токена с id из params
  if (parseInt(req.params.id) !== res.locals.user.id) {
    return res.status(403).json({ message: 'Нет доступа к этим данным' });
  }
  // Если всё ок, вызываем getUserById
  return require('../controllers/userController').getUserById(req, res, next);
});

module.exports = userRouter;
