const jwt = require('jsonwebtoken');

const { JWT_SECRET } = process.env;
const ERROR_CODE_UNAUTHORIZED = 401;

module.exports = (req, res, next) => {
  const { cookie } = req.headers;

  if (!cookie || !cookie.startsWith('token=')) {
    return res
      .status(ERROR_CODE_UNAUTHORIZED)
      .send({ message: 'Необходима авторизация' });
  }

  const token = cookie.replace('token=', '');
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res
      .status(ERROR_CODE_UNAUTHORIZED)
      .send({ message: 'Необходима авторизация' });
  }

  req.user = payload;

  return next();
};
