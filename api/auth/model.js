const db = require('../../data/dbConfig.js');

const register = ({ username, password }) => {
  return db('users')
    .insert({ username, password })
    .then(([id]) => findBy({ id }));
};

const findBy = (filter) => {
  return db('users').where(filter).first();
};

module.exports = { register, findBy };
