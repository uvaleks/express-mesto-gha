const user = require('../models/user');

const ERROR_CODE_VALIDATION = 400;
const ERROR_CODE_NOT_FOUND = 404;
const ERROR_CODE_DEFAULT = 500;

const getUsers = async (req, res) => {
  try {
    const users = await user.find({});
    return res.status(200).send(users);
  } catch (error) {
    return res.status(ERROR_CODE_DEFAULT).send({ message: 'Ошибка на стороне севера' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const foundUser = await user.findById(userId);
    if (!foundUser) {
      throw new Error('NotFound');
    }
    return res.status(200).send(foundUser);
  } catch (error) {
    if (error.message === 'NotFound') {
      return res.status(ERROR_CODE_NOT_FOUND).send({ message: 'Пользователь по id не найден' });
    }
    if (error.name === 'CastError') {
      return res.status(ERROR_CODE_VALIDATION).send({ message: 'Передан не валидный id' });
    }
    return res.status(ERROR_CODE_DEFAULT).send({ message: 'Ошибка на стороне севера' });
  }
};

const createUser = async (req, res) => {
  try {
    const newUser = user(req.body);
    return res.status(201).send(await newUser.save());
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(ERROR_CODE_VALIDATION).send({ message: 'Ошибка валидации полей', ...error });
    }
    return res.status(ERROR_CODE_DEFAULT).send({ message: 'Ошибка на стороне севера' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const update = req.body;
    const foundUser = await user.findById(req.user._id);
    if (!foundUser) {
      throw new Error('NotFound');
    }
    if (update.name) {
      foundUser.name = update.name;
    }
    if (update.about) {
      foundUser.about = update.about;
    }
    return res.status(200).send(await foundUser.save());
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(ERROR_CODE_VALIDATION).send({ message: 'Ошибка валидации полей', ...error });
    }
    if (error.message === 'NotFound') {
      return res.status(ERROR_CODE_NOT_FOUND).send({ message: 'Пользователь по id не найден' });
    }
    return res.status(ERROR_CODE_DEFAULT).send({ message: 'Ошибка на стороне севера' });
  }
};

const updateAvatar = async (req, res) => {
  try {
    const update = req.body;
    const foundUser = await user.findById(req.user._id);
    if (!foundUser) {
      throw new Error('NotFound');
    }
    if (update.avatar) {
      foundUser.avatar = update.avatar;
    }
    return res.status(200).send(await foundUser.save());
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(ERROR_CODE_VALIDATION).send({ message: 'Ошибка валидации полей', ...error });
    }
    if (error.message === 'NotFound') {
      return res.status(ERROR_CODE_NOT_FOUND).send({ message: 'Пользователь по id не найден' });
    }
    return res.status(ERROR_CODE_DEFAULT).send({ message: 'Ошибка на стороне севера' });
  }
};

module.exports = {
  createUser,
  getUserById,
  getUsers,
  updateProfile,
  updateAvatar,
};
