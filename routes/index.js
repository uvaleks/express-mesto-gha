const { Router } = require('express');
const NotFoundError = require('../errors/not-found-error');
const userRouter = require('./users');
const cardRouter = require('./cards');

const router = Router();

router.use('/users', userRouter);
router.use('/cards', cardRouter);

router.use((req, res, next) => {
  const err = new NotFoundError('Неправильный путь');
  next(err);
});

// router.use((err, req, res, next) => {
//   res.status(err.status || 500);
//   res.json({
//     status: err.statusCode,
//     message: err.message,
//   });
//   next(err);
// });

module.exports = router;
