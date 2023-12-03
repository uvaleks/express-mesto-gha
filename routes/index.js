const { Router } = require('express');
const NotFoundError = require('../errors/not-found-error');
const userRouter = require('./users');
const cardRouter = require('./cards');

const router = Router();

router.use('/users', userRouter);
router.use('/cards', cardRouter);

router.use((req, res) => {
  const err = new NotFoundError('Неправильный путь');
  res.status(err.statusCode).send({ message: err.message });
});

router.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
  });
  next();
});

module.exports = router;
