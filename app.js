const express = require('express');
const { json } = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const { celebrate, Joi, errors } = require('celebrate');
const {
  login,
  createUser,
} = require('./controllers/users');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const auth = require('./middlewares/auth');
const router = require('./routes');

const app = express();

const { PORT, MONGO_URL = 'mongodb://localhost:27017/mestodb' } = process.env;

mongoose.connect(MONGO_URL);

app.use(json());

app.use(requestLogger);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().required(),
  }),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(/^(http|https):\/\/(www\.)?[\w-]+\.\w+\/?[^#\s]*/),
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().required(),
  }),
}), createUser);

app.use(auth);

app.use(router);

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  if (err.code === 11000) {
    res.status(409).send({
      status: 409,
      message: 'Пользователь с таким email уже существует',
    });
  }
  res.status(err.statusCode || 500).send({
    status: err.statusCode,
    message: err.message,
  });
  next();
});

app.listen(PORT);
