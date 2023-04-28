const Activity = require('./activity');
const Campaign = require('./campaign');

const sql = require('../../db.js');
const shortId = require('shortid');
const {
  filter: queryFilter,
  skipLimit,
  SQLTableAsync,
  SQLRowAsync,
} = require('../queryTools');

//Client object constructor
const Client = function (client) {
  this._id = shortId();

  this.company = client.company;
  this.person = client.person; // Optional
  this.email = client.email; // Optional
  this.phone = client.phone; // Optional
};

Client.create = function (object, cb) {
  sql.query('INSERT INTO Client set ?', object, function (err) {
    if (err) {
      console.log('error: ', err);
      cb(err, null);
    } else {
      cb(null, object);
    }
  });
};
Client.createAsync = async function (object) {
  return new Promise((resolve, reject) => {
    sql.query('INSERT INTO Client set ?', object, function (err) {
      if (err) reject(err);
      else resolve(object);
    });
  });
};
Client.getById = function (id, result, select) {
  sql.query(
    `SELECT ${select ? select : '*'} FROM Client WHERE _id = ? LIMIT 1`,
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
Client.getAll = function (result, options) {
  const select = options ? options.select : null;
  sql.query(
    `Select ${select ? select : '*'} from Client ${skipLimit(options)}`,
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
Client.getAllAsync = async function (options) {
  const select = options ? options.select : null;
  return new Promise((resolve, reject) => {
    sql.query(
      `Select ${select ? select : '*'} from Client ${skipLimit(options)}`,
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
Client.query = (filter, cb, options) => {
  const select = options ? options.select : null;
  sql.query(
    `SELECT ${select ? select : '*'} FROM Client ${queryFilter(
      filter
    )} ${skipLimit(options)}`,
    null,
    (err, data) => {
      if (err) cb(err, null);
      cb(null, data);
    }
  );
};
Client.queryAsync = async (filter, options) => {
  const select = options ? options.select : null;
  return await new Promise((resolve, reject) => {
    sql.query(
      `SELECT ${select ? select : '*'} FROM Client ${queryFilter(
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
Client.update = (id, object, cb) => {
  delete object._id;
  sql.query(`UPDATE Client SET ? WHERE _id = ?`, [object, id], (err, data) => {
    if (err) return cb(err, null);
    object._id = id;
    cb(null, object);
  });
};
Client.updateAsync = (id, object) => {
  delete object._id;
  return new Promise((resolve, reject) => {
    sql.query(
      `UPDATE Client SET ? WHERE _id = ?`,
      [object, id],
      (err, data) => {
        if (err) reject(err);
        object._id = id;
        resolve(object);
      }
    );
  });
};
Client.remove = function (id, cb) {
  sql.query('DELETE FROM Client WHERE _id = ?', [id], function (err, res) {
    if (err) return cb(false);
    cb(true);
  });
};
Client.deleteOneAsync = async (id) => {
  if (!shortId.isValid(id)) return false;
  const object = await SQLRowAsync('Client', { _id: id }, '_id');
  if (!object) return null;

  const campaigns = await SQLTableAsync(
    'Campaign',
    { client_id: object._id },
    '_id'
  );
  await Campaign.deleteAllAsync(campaigns);

  const activities = await SQLTableAsync(
    'Activity',
    { client_id: object._id },
    '_id'
  );
  await Activity.deleteAllAsync(activities);

  return await new Promise((resolve) => {
    sql.query(`DELETE FROM Client WHERE _id = ?`, [object._id], (err) =>
      resolve(!!!err)
    );
  });
};
module.exports = Client;
