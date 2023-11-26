const { Router } = require('express');
const {
  getUserById,
  getUsers,
  getUser,
  updateProfile,
  updateAvatar,
} = require('../controllers/users');

const userRouter = Router();

userRouter.get('/', getUsers);
userRouter.get('/:userId', getUserById);
userRouter.get('/me', getUser);
userRouter.patch('/me', updateProfile);
userRouter.patch('/me/avatar', updateAvatar);

module.exports = userRouter;
