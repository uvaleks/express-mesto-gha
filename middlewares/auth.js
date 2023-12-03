const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-error');

const { JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const { cookie } = req.headers;

  if (!cookie || !cookie.startsWith('token=')) {
    next(new UnauthorizedError('Необходима авторизация'));
  } else {
    const token = cookie.replace('token=', '');

    jwt.verify(token, JWT_SECRET)
      .then((decoded) => {
        req.user = decoded;
        next();
      })
      .catch(() => {
        next(new UnauthorizedError('Необходима авторизация'));
      });
  }
};

// module.exports = (req, res, next) => {
//   const { cookie } = req.headers;

//   if (!cookie || !cookie.startsWith('token=')) {
//     throw new UnautorizedError('Необходима авторизация');
//   }

//   const token = cookie.replace('token=', '');
//   let payload;

//   try {
//     payload = jwt.verify(token, JWT_SECRET);
//   } catch (err) {
//     throw new UnautorizedError('Необходима авторизация');
//   }

//   req.user = payload;

//   return next();
// };
