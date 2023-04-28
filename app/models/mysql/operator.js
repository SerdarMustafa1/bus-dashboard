const sql = require('../../db.js');
const shortId = require('shortid');
const { filter: queryFilter, skipLimit } = require('../queryTools');

//Operator object constructor
const Operator = function (operator) {
  this._id = shortId();

  this.operatorId = operator.operatorId;
  this.company = operator.company; // Optional if it is registered in the worker.
  this.city_id = operator.city_id;
  this.listed = 1;
  this.visible = 1;
};

Operator.create = function (object, cb) {
  sql.query('INSERT INTO Operator set ?', object, function (err) {
    if (err) {
      console.log('error: ', err);
      cb(err, null);
    } else {
      cb(null, object);
    }
  });
};
Operator.getById = function (id, cb, select) {
  sql.query(
    `SELECT ${select ? select : '*'} FROM Operator WHERE _id = ? LIMIT 1`,
    id,
    function (err, res) {
      if (err) {
        console.log('error: ', err);
        return cb(err, null);
      }
      if (res.length > 0) cb(null, res[0]);
      else cb(null, null);
    }
  );
};
Operator.getAll = function (cb, options) {
  const select = options ? options.select : null;
  sql.query(
    `Select ${select ? select : '*'} from Operator ${skipLimit(options)}`,
    function (err, res) {
      if (err) {
        console.log('error: ', err);
        cb(err, null);
      } else {
        cb(null, res);
      }
    }
  );
};
Operator.getAllAsync = async function (options) {
  const select = options ? options.select : null;
  return new Promise((resolve, reject) => {
    sql.query(
      `Select ${select ? select : '*'} from Operator ${skipLimit(options)}`,
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
Operator.query = (filter, cb, options) => {
  const select = options ? options.select : null;
  sql.query(
    `SELECT ${select ? select : '*'} FROM Operator ${queryFilter(
      filter
    )} ${skipLimit(options)}`,
    null,
    (err, data) => {
      if (err) cb(err, null);
      cb(null, data);
    }
  );
};
Operator.queryAsync = async (filter, options) => {
  const select = options ? options.select : null;
  return await new Promise((resolve, reject) => {
    sql.query(
      `SELECT ${select ? select : '*'} FROM Operator ${queryFilter(
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
Operator.update = (id, object, cb) => {
  delete object._id;
  sql.query(
    `UPDATE Operator SET ? WHERE _id = ?`,
    [object, id],
    (err, data) => {
      if (err) return cb(err, null);
      object._id = id;
      cb(null, object);
    }
  );
};
Operator.updateAsync = async (id, object) => {
  delete object._id;
  return await new Promise((resolve, reject) => {
    sql.query(
      `UPDATE Operator SET ? WHERE _id = ?`,
      [object, id],
      (err, data) => {
        if (err) reject(err);
        object._id = id;
        resolve(object);
      }
    );
  });
};
Operator.remove = async function (id, cb) {
  sql.query('DELETE FROM Operator WHERE _id = ?', [id], function (err, res) {
    if (err) return cb(false);
    cb(true);
  });
};

module.exports = Operator;
