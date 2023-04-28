const sql = require('../../db.js');
const shortId = require('shortid');
const { filter: queryFilter, skipLimit } = require('../queryTools');

//Place object constructor
const Place = function (place) {
  this._id = shortId();
  this.name = place.name;
};

Place.create = function (object, cb) {
  sql.query('INSERT INTO Place set ?', object, function (err) {
    if (err) {
      console.log('error: ', err);
      cb(err, null);
    } else {
      cb(null, object);
    }
  });
};
Place.createAsync = function (object) {
  return new Promise((resolve, reject) => {
    sql.query('INSERT INTO Place set ?', object, function (err) {
      if (err) reject(err);
      else resolve(object);
    });
  });
};
Place.getById = function (id, result, select) {
  sql.query(
    `SELECT ${select ? select : '*'} FROM Place WHERE _id = ? LIMIT 1`,
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
Place.getAll = function (result, options) {
  const select = options ? options.select : null;
  sql.query(
    `Select ${select ? select : '*'} from Place ${skipLimit(options)}`,
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
Place.getAllAsync = async function (options) {
  const select = options ? options.select : null;
  return new Promise((resolve, reject) => {
    sql.query(
      `Select ${select ? select : '*'} from Place ${skipLimit(options)}`,
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
Place.query = (filter, cb, options) => {
  const select = options ? options.select : null;
  sql.query(
    `SELECT ${select ? select : '*'} FROM Place ${queryFilter(
      filter
    )} ${skipLimit(options)}`,
    null,
    (err, data) => {
      if (err) cb(err, null);
      cb(null, data);
    }
  );
};
Place.queryAsync = async (filter, options) => {
  const select = options ? options.select : null;
  return await new Promise((resolve, reject) => {
    sql.query(
      `SELECT ${select ? select : '*'} FROM Place ${queryFilter(
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
Place.update = (id, object, cb) => {
  delete object._id;
  sql.query(`UPDATE Place SET ? WHERE _id = ?`, [object, id], (err, data) => {
    if (err) return cb(err, null);
    object._id = id;
    cb(null, object);
  });
};
Place.updateAsync = (id, object) => {
  delete object._id;
  return new Promise((resolve, reject) => {
    sql.query(`UPDATE Place SET ? WHERE _id = ?`, [object, id], (err, data) => {
      if (err) reject(err);
      object._id = id;
      resolve(object);
    });
  });
};
Place.remove = async function (id, cb) {
  sql.query('DELETE FROM Place WHERE _id = ?', [id], function (err, res) {
    if (err) return cb(false);
    cb(true);
  });
};
module.exports = Place;
