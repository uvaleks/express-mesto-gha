const { Router } = require('express');
const { celebrate, Joi, errors } = require('celebrate');
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
  params: Joi.object({
    userId: Joi.string().hex().length(24),
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
    avatar: Joi.string().pattern(/^(http|https):\/\/(www\.)?[\w-]+\.\w+\/?[^#\s]*/),
  }),
}), updateAvatar);

userRouter.use(errors());

module.exports = userRouter;
