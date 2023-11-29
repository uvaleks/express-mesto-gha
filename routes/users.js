const { Router } = require('express');
const { celebrate, Joi } = require('celebrate');
const {
  getUserById,
  getUsers,
  getUser,
  updateProfile,
  updateAvatar,
} = require('../controllers/users');

const userRouter = Router();

userRouter.get('/', getUsers);
userRouter.get('/me', getUser);
userRouter.get('/:userId', celebrate({
  body: Joi.object().keys({
    name: Joi.string().length(24).required(),
  }),
}), getUserById);
userRouter.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateProfile);
userRouter.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().uri(),
  }),
}), updateAvatar);

module.exports = userRouter;
