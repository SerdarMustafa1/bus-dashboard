const sql = require('../../db.js');
const { filter: queryFilter, skipLimit } = require('../queryTools');

//Email object constructor
const Email = function (email) {
  this.email = email.email;
  this.isValid = email.isValid;
};

Email.create = function (object, cb) {
  sql.query('INSERT INTO Email set ?', object, function (err) {
    if (err) {
      console.log('error: ', err);
      cb(err, null);
    } else {
      cb(null, object);
    }
  });
};
Email.createAsync = async function (object) {
  return new Promise((resolve, reject) => {
    sql.query('INSERT INTO Email set ?', object, function (err) {
      if (err) return reject(err);
      else resolve(object);
    });
  });
};
Email.getAllAsync = async function (options) {
  const select = options ? options.select : null;
  return new Promise((resolve, reject) => {
    sql.query(
      `Select ${select ? select : '*'} from Email ${skipLimit(options)}`,
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
Email.getByEmail = async (email) => {
  return await new Promise((resolve, reject) => {
    sql.query(
      `SELECT * FROM Email WHERE email = ? LIMIT 1`,
      [email],
      (err, data) => {
        if (err) return reject(err);
        if (data.length > 0) resolve(data[0]);
        else return resolve(null);
      }
    );
  });
};

Email.queryAsync = async (filter, options) => {
  const select = options ? options.select : null;
  return await new Promise((resolve, reject) => {
    sql.query(
      `SELECT ${select ? select : '*'} FROM Email ${queryFilter(
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
Email.updateAsync = (id, object) => {
  return new Promise((resolve, reject) => {
    sql.query(`UPDATE Email SET ? WHERE _id = ?`, [object, id], (err, data) => {
      if (err) reject(err);
      resolve(object);
    });
  });
};

module.exports = Email;
