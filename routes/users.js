const { Router } = require('express');
const {
  createUser,
  getUserById,
  getUsers,
  updateProfile,
  updateAvatar,
} = require('../controllers/users');

const userRouter = Router();

userRouter.get('/', getUsers);
userRouter.get('/:userId', getUserById);
userRouter.post('/', createUser);
userRouter.patch('/me', updateProfile);
userRouter.patch('/me/avatar', updateAvatar);

module.exports = userRouter;
