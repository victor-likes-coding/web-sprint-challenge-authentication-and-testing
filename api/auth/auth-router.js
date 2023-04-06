const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { register, findBy } = require('./model');
const router = require('express').Router();

router.post('/register', async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return next({ status: 400, message: 'username and password required' });
  }
  // if username is already taken
  try {
    const user = await findBy({ username });
    if (user) {
      return next({ status: 400, message: 'username taken' });
    }
  } catch (err) {
    return next(err);
  }

  const hash = bcrypt.hashSync(password, 8);
  try {
    // successful so generate hash and token
    const result = await register({ username, password: hash });

    res.status(201).json({
      ...result,
    });
  } catch (err) {
    next(err);
  }
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
});

router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next({ status: 400, message: 'username and password required' });
  }

  // on username not existing in db or password being incorrect
  try {
    const user = await findBy({ username });
    if (!user) {
      return next({ status: 401, message: 'invalid credentials' });
    }

    const passwordValid = bcrypt.compareSync(password, user.password);
    if (!passwordValid) {
      return next({ status: 401, message: 'invalid credentials' });
    }
    // on success
    // generate token
    const token = jwt.sign(
      {
        subject: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET || 'shh',
      {
        expiresIn: '1d',
      }
    );

    res.status(200).json({
      message: `welcome, ${user.username}`,
      token,
    });
  } catch (err) {
    return next(err);
  }
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
});

module.exports = router;
