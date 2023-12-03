const { Router } = require('express');
const userRouter = require('./users');
const cardRouter = require('./cards');

const router = Router();

router.use('/users', userRouter);
router.use('/cards', cardRouter);

router.use((req, res, next) => {
  const error = new Error('Неправильный путь');
  error.status = 404;
  next(error);
});

router.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
  });
  next();
});

module.exports = router;
