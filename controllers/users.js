const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const ConflictError = require('../errors/conflict-error');
const NotFoundError = require('../errors/not-found-error');
const UnauthorizedError = require('../errors/unauthorized-error');
const user = require('../models/user');

const { JWT_SECRET } = process.env;

const getUsers = async (req, res, next) => {
  user.find({})
    .then((users) => {
      res.status(200).send(users);
    })
    .catch(next);
};

const getUserById = async (req, res, next) => {
  const { userId } = req.params;
  user.findById(userId)
    .then((foundUser) => {
      if (!foundUser) {
        throw new NotFoundError('Пользователь по id не найден');
      }
      res.status(200).send(foundUser);
    })
    .catch(next);
};

const getUser = (req, res, next) => {
  const { _id } = req.user;
  console.log(_id);
  user.findOne({ _id })
    .then((foundUser) => {
      if (!foundUser) {
        throw new NotFoundError('Пользователь по id не найден');
      }
      res.status(200).send(foundUser);
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => {
      req.body.password = hash;
      return user.create(req.body);
    })
    .then((createdUser) => {
      const { email } = createdUser;
      return user.findOne({ email });
    })
    .then((foundUser) => res.status(201).send(foundUser))
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError('Пользователь уже существует'));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  user.findOne({ email }).select('+password')
    .then((foundUser) => {
      if (!foundUser) {
        throw new UnauthorizedError('Неправильные почта или пароль');
      }
      return bcrypt.compare(password, foundUser.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedError('Неправильные почта или пароль');
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
    .catch(next);
};

const updateProfile = (req, res, next) => {
  const update = req.body;
  user.findById(req.user._id)
    .then((foundUser) => {
      if (!foundUser) {
        throw new NotFoundError('Пользователь по id не найден');
      }
      const updatedFields = {};
      if (update.name) {
        updatedFields.name = update.name;
      }
      if (update.about) {
        updatedFields.about = update.about;
      }
      return user.findByIdAndUpdate(req.user._id, updatedFields, { new: true });
    })
    .then((savedUser) => {
      res.status(200).send(savedUser);
    })
    .catch(next);
};

const updateAvatar = async (req, res, next) => {
  const update = req.body;
  user.findById(req.user._id)
    .then((foundUser) => {
      if (!foundUser) {
        throw new NotFoundError('Пользователь по id не найден');
      }
      const updatedUser = { ...foundUser._doc };
      if (update.avatar) {
        updatedUser.avatar = update.avatar;
      }
      return user.findByIdAndUpdate(req.user._id, updatedUser, { new: true });
    })
    .then((savedUser) => {
      res.status(200).send(savedUser);
    })
    .catch(next);
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
