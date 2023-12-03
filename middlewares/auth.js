const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-error');

const { JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const { cookie } = req.headers;

  if (!cookie || !cookie.startsWith('token=')) {
    next(new UnauthorizedError('Неправильные почта или пароль'));
  } else {
    const token = cookie.replace('token=', '');

    jwt.verify(token, JWT_SECRET)
      .then((decoded) => {
        req.user = decoded;
        next();
      })
      .catch((err) => {
        next(err);
      });
  }
};
