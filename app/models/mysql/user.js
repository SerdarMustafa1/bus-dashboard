const Activity = require('./activity');
const Install = require('./install');
const Remove = require('./remove');

const sql = require('../../db.js');
const shortId = require('shortid');
const {
  filter: queryFilter,
  skipLimit,
  SQLTableAsync,
  SQLRowAsync,
} = require('../queryTools');

//User object constructor
const User = function (user) {
  this._id = shortId();

  this.name = user.name;
  this.email = user.email;
  this.phone = user.phone;
  this.role = user.role;
  this.password = user.password;
  this.city_id = user.city_id;
};

User.create = function (user, cb) {
  sql.query('INSERT INTO User set ?', user, function (err) {
    if (err) {
      console.log('error: ', err);
      cb(err, null);
    } else {
      cb(null, user);
    }
  });
};
User.createAsync = async function (user) {
  return new Promise((resolve, reject) => {
    sql.query('INSERT INTO User set ?', user, function (err) {
      if (err) reject(err);
      else resolve(user);
    });
  });
};
User.getById = function (id, result, select) {
  sql.query(
    `SELECT ${select ? select : '*'} FROM User WHERE _id = ? LIMIT 1`,
    id,
    function (err, res) {
      if (err) {
        console.log('error: ', err);
        return result(err, null);
      }
      if (res.length > 0) result(null, res[0]);
      else result(null, null);
    }
  );
};
User.getAll = function (result, options) {
  const select = options ? options.select : null;
  sql.query(
    `Select ${select ? select : '*'} from User ${skipLimit(options)}`,
    function (err, res) {
      if (err) {
        console.log('error: ', err);
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};
User.getAllAsync = async function (options) {
  const select = options ? options.select : null;
  return new Promise((resolve, reject) => {
    sql.query(
      `Select ${select ? select : '*'} from User ${skipLimit(options)}`,
      function (err, res) {
        if (err) {
          console.log('error: ', err);
          reject(err);
        } else {
          resolve(res);
        }
      }
    );
  });
};
User.query = (filter, cb, options) => {
  const select = options ? options.select : null;
  sql.query(
    `SELECT ${select ? select : '*'} FROM User ${queryFilter(
      filter
    )} ${skipLimit(options)}`,
    null,
    (err, data) => {
      if (err) cb(err, null);
      cb(null, data);
    }
  );
};
User.queryAsync = async (filter, options) => {
  const select = options ? options.select : null;
  return await new Promise((resolve, reject) => {
    sql.query(
      `SELECT ${select ? select : '*'} FROM User ${queryFilter(
        filter
      )} ${skipLimit(options)}`,
      null,
      (err, data) => {
        if (err) return reject(err);
        return resolve(data);
      }
    );
  });
};
User.update = (id, object, cb) => {
  delete object._id;
  sql.query(`UPDATE User SET ? WHERE _id = ?`, [object, id], (err, data) => {
    if (err) return cb(err, null);
    object._id = id;
    cb(null, object);
  });
};
User.updateAsync = (id, object) => {
  delete object._id;
  return new Promise((resolve, reject) => {
    sql.query(`UPDATE User SET ? WHERE _id = ?`, [object, id], (err, data) => {
      if (err) reject(err);
      object._id = id;
      resolve(object);
    });
  });
};
User.remove = async function (id, cb) {
  sql.query('DELETE FROM User WHERE _id = ?', [id], function (err, res) {
    if (err) return cb(false);
    cb(true);
  });
};

User.createUser = async function (user) {
  user.password = await require('bcryptjs').hash(user.password, 12);
  sql.query('INSERT IGNORE INTO User set ?', user, function (err) {
    if (err) console.log('Admin creation failed!', err);
  });
};
User.getUserByEmailAsync = async function (email) {
  return new Promise((resolve, reject) => {
    sql.query('SELECT * FROM User WHERE email = ? LIMIT 1', email, function (
      err,
      res
    ) {
      if (err) return reject(err);
      if (res.length > 0) resolve(res[0]);
      else resolve(null);
    });
  });
};
User.resetPassword = async function (id, hash, result) {
  sql.query(
    'UPDATE User SET password = ?, passwordToken = NULL, passwordTokenExpires = NULL WHERE _id = ?',
    [hash, id],
    function (err, res) {
      if (err) result(err, null);
      else result(null, res);
    }
  );
};
User.deleteOneAsync = async (id) => {
  if (!shortId.isValid(id)) return false;
  const object = await SQLRowAsync('User', { _id: id }, '_id');
  if (!object) return null;

  return await new Promise((resolve) => {
    sql.query(`DELETE FROM User WHERE _id = ?`, [object._id], (err) => {
      if (err) resolve(false);
      else resolve(true);
    });
  });
};

module.exports = User;
