const Activity = require('./activity');

const sql = require('../../db.js');
const shortId = require('shortid');
const {
  filter: queryFilter,
  skipLimit,
  SQLTableAsync,
  SQLRowAsync,
} = require('../queryTools');

//Installer object constructor
const Installer = function (installer) {
  this._id = shortId();

  this.team_id = installer.team_id;
  this.user_id = installer.user_id;
};

Installer.create = function (object, cb) {
  sql.query('INSERT INTO Installer set ?', object, function (err) {
    if (err) {
      console.log('error: ', err);
      cb(err, null);
    } else {
      cb(null, object);
    }
  });
};
Installer.createAsync = async function (object) {
  return new Promise((resolve, reject) => {
    sql.query('INSERT INTO Installer set ?', object, function (err) {
      if (err) reject(err);
      else resolve(object);
    });
  });
};
Installer.getById = function (id, result, select) {
  sql.query(
    `SELECT ${select ? select : '*'} FROM Installer WHERE _id = ? LIMIT 1`,
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
Installer.getAll = function (result, options) {
  const select = options ? options.select : null;
  sql.query(
    `Select ${select ? select : '*'} from Installer ${skipLimit(options)}`,
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
Installer.getAllAsync = async function (options) {
  const select = options ? options.select : null;
  return new Promise((resolve, reject) => {
    sql.query(
      `Select ${select ? select : '*'} from Installer ${skipLimit(options)}`,
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
Installer.query = (filter, cb, options) => {
  const select = options ? options.select : null;
  sql.query(
    `SELECT ${select ? select : '*'} FROM Installer ${queryFilter(
      filter
    )} ${skipLimit(options)}`,
    null,
    (err, data) => {
      if (err) cb(err, null);
      cb(null, data);
    }
  );
};
Installer.queryAsync = async (filter, options) => {
  const select = options ? options.select : null;
  return await new Promise((resolve, reject) => {
    sql.query(
      `SELECT ${select ? select : '*'} FROM Installer ${queryFilter(
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
Installer.update = (id, object, cb) => {
  delete object._id;
  sql.query(
    `UPDATE Installer SET ? WHERE _id = ?`,
    [object, id],
    (err, data) => {
      if (err) return cb(err, null);
      object._id = id;
      cb(null, object);
    }
  );
};
Installer.updateAsync = (id, object) => {
  delete object._id;
  return new Promise((resolve, reject) => {
    sql.query(
      `UPDATE Installer SET ? WHERE _id = ?`,
      [object, id],
      (err, data) => {
        if (err) reject(err);
        object._id = id;
        resolve(object);
      }
    );
  });
};
Installer.deleteOneAsync = async function (_id) {
  if (!shortId.isValid(_id)) return false;

  const object = await SQLRowAsync('Installer', { _id }, '_id');
  if (!object) return null;

  return await new Promise((resolve, reject) => {
    sql.query(`DELETE FROM Installer WHERE _id = ?`, [object._id], (err) =>
      err ? reject(err) : resolve(true)
    );
  });
};
Installer.deleteAllAsync = async function (objs) {
  try {
    for (const obj of objs) await Installer.deleteOneAsync(obj._id);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};
module.exports = Installer;
