const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-error');

const { JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  let payload;

  try {
    const { cookie } = req.headers;

    if (!cookie || !cookie.startsWith('token=')) {
      throw new UnauthorizedError('Необходима авторизация');
    }

    const token = cookie.replace('token=', '');

    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    next(err);
  }

  req.user = payload;

  return next();
};
