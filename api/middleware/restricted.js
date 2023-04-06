const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return next({ status: 401, message: 'token required' });

  // validate token
  jwt.verify(token, process.env.JWT_SECRET || 'shh', (err, decodedToken) => {
    if (err) {
      next({ status: 401, message: 'token invalid' });
    } else {
      req.decodedToken = decodedToken;
      next();
    }
  });

  /*
    IMPLEMENT

    1- On valid token in the Authorization header, call next.

    2- On missing token in the Authorization header,
      the response body should include a string exactly as follows: "token required".

    3- On invalid or expired token in the Authorization header,
      the response body should include a string exactly as follows: "token invalid".
  */
};
