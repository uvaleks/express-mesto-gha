const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const user = require('../models/user');

const { JWT_SECRET } = process.env;

const ERROR_CODE_VALIDATION = 400;
const ERROR_CODE_UNAUTHORIZED = 401;
const ERROR_CODE_NOT_FOUND = 404;
const ERROR_CODE_CONFLICT = 409;
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

const getUser = (req, res) => {
  const { _id } = req.user;
  console.log(_id);
  user.findOne({ _id })
    .then((foundUser) => {
      if (!foundUser) {
        throw new Error('NotFound');
      }
      res.status(200).send(foundUser);
    })
    .catch((error) => {
      if (error.message === 'NotFound') {
        return res.status(ERROR_CODE_NOT_FOUND).send({ message: 'Пользователь по id не найден' });
      }
      return res.status(ERROR_CODE_DEFAULT).send({ message: 'Ошибка на стороне севера' });
    });
};

const createUser = (req, res) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => {
      req.body.password = hash;
      const { email } = req.body;
      return user.findOne({ email });
    })
    .then((foundUser) => {
      if (foundUser) {
        // throw new Error('Conflict');
        return Promise.reject(new Error('Conflict'));
      }
      return user.create(req.body);
    })
    .then((createdUser) => {
      const { email } = createdUser;
      return user.findOne({ email });
    })
    .then((foundUser) => res.status(201).send(foundUser))
    .catch((error) => {
      if (error.message === 'Conflict') {
        return res.status(ERROR_CODE_CONFLICT).send({ message: 'Пользователь с таким email уже существует' });
      }
      if (error.name === 'ValidationError') {
        return res.status(ERROR_CODE_VALIDATION).send({ message: 'Ошибка валидации полей', ...error });
      }
      return res.status(ERROR_CODE_DEFAULT).send({ message: 'Ошибка на стороне севера' });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;
  user.findOne({ email }).select('+password')
    .then((foundUser) => {
      if (!foundUser) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }
      return bcrypt.compare(password, foundUser.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error('Неправильные почта или пароль'));
          }

          console.log('foundUser._id = ', { _id: foundUser._id.toString() });

          const token = jwt.sign(
            { _id: foundUser._id.toString() },
            JWT_SECRET,
            { expiresIn: '7d' },
          );

          console.log('token = ', token);

          res.setHeader('Set-Cookie', cookie.serialize('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
          }));

          return res.status(200).send({ message: 'Всё верно!' });
        });
    })
    .catch((err) => {
      res
        .status(ERROR_CODE_UNAUTHORIZED)
        .send({ message: err.message });
    });
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
  login,
  createUser,
  getUserById,
  getUsers,
  getUser,
  updateProfile,
  updateAvatar,
};
