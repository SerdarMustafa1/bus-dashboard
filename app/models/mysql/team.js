const sql = require('../../db.js');
const shortId = require('shortid');
const {
  filter: queryFilter,
  skipLimit,
  SQLTableAsync,
  SQLRowAsync,
} = require('../queryTools');

//Team object constructor
const Team = function (client) {
  this._id = shortId();

  this.company = client.company;
};

Team.createAsync = async function (object) {
  return new Promise((resolve, reject) => {
    sql.query('INSERT INTO Team set ?', object, function (err) {
      if (err) reject(err);
      else resolve(object);
    });
  });
};
Team.getById = function (id, result, select) {
  sql.query(
    `SELECT ${select ? select : '*'} FROM Team WHERE _id = ? LIMIT 1`,
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
Team.getAll = function (result, options) {
  const select = options ? options.select : null;
  sql.query(
    `Select ${select ? select : '*'} from Team ${skipLimit(options)}`,
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
Team.getAllAsync = async function (options) {
  const select = options ? options.select : null;
  return new Promise((resolve, reject) => {
    sql.query(
      `Select ${select ? select : '*'} from Team ${skipLimit(options)}`,
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
Team.query = (filter, cb, options) => {
  const select = options ? options.select : null;
  sql.query(
    `SELECT ${select ? select : '*'} FROM Team ${queryFilter(
      filter
    )} ${skipLimit(options)}`,
    null,
    (err, data) => {
      if (err) cb(err, null);
      cb(null, data);
    }
  );
};
Team.queryAsync = async (filter, options) => {
  const select = options ? options.select : null;
  return await new Promise((resolve, reject) => {
    sql.query(
      `SELECT ${select ? select : '*'} FROM Team ${queryFilter(
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
Team.updateAsync = (id, object) => {
  delete object._id;
  return new Promise((resolve, reject) => {
    sql.query(`UPDATE Team SET ? WHERE _id = ?`, [object, id], (err, data) => {
      if (err) reject(err);
      object._id = id;
      resolve(object);
    });
  });
};
Team.removeAsync = function (id) {
  return new Promise((resolve) => {
    sql.query('DELETE FROM Team WHERE _id = ?', [id], function (err, res) {
      if (err) resolve(false);
      else resolve(true);
    });
  });
};
Team.deleteOneAsync = async (id) => {
  if (!shortId.isValid(id)) return false;
  // const object = await SQLRowAsync('Team', {_id: id}, '_id');
  // if (!object) return null;

  return await new Promise((resolve) => {
    sql.query(`DELETE FROM Team WHERE _id = ?`, [object._id], (err) =>
      resolve(!!!err)
    );
  });
};
module.exports = Team;
