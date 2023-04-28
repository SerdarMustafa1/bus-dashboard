const sql = require('../../db.js');
const shortId = require('shortid');
const { filter: queryFilter, skipLimit } = require('../queryTools');

//City object constructor
const City = function (city) {
  this._id = shortId();

  this.name = city.name;
  this.short = city.short;
  this.latitude = city.latitude;
  this.longitude = city.longitude;
};

City.create = function (object, cb) {
  sql.query('INSERT INTO City set ?', object, function (err) {
    if (err) {
      console.log('error: ', err);
      cb(err, null);
    } else {
      cb(null, object);
    }
  });
};
City.getById = function (id, result, select) {
  sql.query(
    `SELECT ${select ? select : '*'} FROM City WHERE _id = ? LIMIT 1`,
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
City.getAll = function (result, options) {
  const select = options ? options.select : null;
  sql.query(
    `Select ${select ? select : '*'} from City ${skipLimit(options)}`,
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
City.getAllAsync = async function (options) {
  const select = options ? options.select : null;
  return new Promise((resolve, reject) => {
    sql.query(
      `Select ${select ? select : '*'} from City ${skipLimit(options)}`,
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
City.query = (filter, cb, options) => {
  const select = options ? options.select : null;
  sql.query(
    `SELECT ${select ? select : '*'} FROM City ${queryFilter(
      filter
    )} ${skipLimit(options)}`,
    null,
    (err, data) => {
      if (err) cb(err, null);
      cb(null, data);
    }
  );
};
City.queryAsync = async (filter, options) => {
  const select = options ? options.select : null;
  return await new Promise((resolve, reject) => {
    sql.query(
      `SELECT ${select ? select : '*'} FROM City ${queryFilter(
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
City.update = (id, object, cb) => {
  delete object._id;
  sql.query(`UPDATE City SET ? WHERE _id = ?`, [object, id], (err, data) => {
    if (err) return cb(err, null);
    object._id = id;
    cb(null, object);
  });
};
City.updateAsync = (id, object) => {
  delete object._id;
  return new Promise((resolve, reject) => {
    sql.query(`UPDATE City SET ? WHERE _id = ?`, [object, id], (err, data) => {
      if (err) reject(err);
      object._id = id;
      resolve(object);
    });
  });
};
City.remove = async function (id, cb) {
  sql.query('DELETE FROM City WHERE _id = ?', [id], function (err, res) {
    if (err) return cb(false);
    cb(true);
  });
};

module.exports = City;
