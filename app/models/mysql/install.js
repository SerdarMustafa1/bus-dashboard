const Activity = require('./activity');

const sql = require('../../db.js');
const {
  filter: queryFilter,
  skipLimit,
  SQLTableAsync,
  SQLRowAsync,
} = require('../queryTools');

//Install object constructor
const Install = function (install) {
  this.vehicle_id = install.vehicle_id;
  this.installer_id = install.installer_id;
  this.placement_id = install.placement_id;
  this.campaign_id = install.campaign_id;
  this.team_id = install.team_id;
  this.count = install.count;
  this.installed = 1;
};

Install.create = function (object, cb) {
  sql.query('INSERT INTO Install set ?', object, function (err) {
    if (err) {
      console.log('error: ', err);
      cb(err, null);
    } else {
      cb(null, object);
    }
  });
};
Install.createAsync = async function (object) {
  return new Promise((resolve, reject) => {
    sql.query('INSERT INTO Install set ?', object, function (err, data) {
      if (err) return reject(err);
      object.id = data.insertId;
      resolve(object);
    });
  });
};
Install.getById = function (id, result, select) {
  sql.query(
    `SELECT ${select ? select : '*'} FROM Install WHERE id = ? LIMIT 1`,
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
Install.getAll = function (result, options) {
  const select = options ? options.select : null;
  sql.query(
    `Select ${select ? select : '*'} from Install ${skipLimit(options)}`,
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
Install.getAllAsync = async function (options) {
  const select = options ? options.select : null;
  return new Promise((resolve, reject) => {
    sql.query(
      `Select ${select ? select : '*'} from Install ${skipLimit(options)}`,
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
Install.query = (filter, cb, options) => {
  const select = options ? options.select : null;
  sql.query(
    `SELECT ${select ? select : '*'} FROM Install ${queryFilter(
      filter
    )} ${skipLimit(options)}`,
    null,
    (err, data) => {
      if (err) cb(err, null);
      cb(null, data);
    }
  );
};
Install.queryAsync = async (filter, options) => {
  const select = options ? options.select : null;
  return await new Promise((resolve, reject) => {
    sql.query(
      `SELECT ${select ? select : '*'} FROM Install ${queryFilter(
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
Install.update = (id, object, cb) => {
  delete object._id;
  sql.query(`UPDATE Install SET ? WHERE id = ?`, [object, id], (err, data) => {
    if (err) return cb(err, null);
    object._id = id;
    cb(null, object);
  });
};
Install.updateAsync = (id, object) => {
  delete object._id;
  return new Promise((resolve, reject) => {
    sql.query(
      `UPDATE Install SET ? WHERE id = ?`,
      [object, id],
      (err, data) => {
        if (err) reject(err);
        object._id = id;
        resolve(object);
      }
    );
  });
};
Install.deleteOneAsync = async function (id) {
  const object = await SQLRowAsync('Install', { id }, 'id');
  if (!object) return null;

  const activities = await SQLTableAsync(
    'Activity',
    { install_id: object.id },
    'id'
  );
  await Activity.deleteAllAsync(activities);

  return await new Promise((resolve, reject) => {
    sql.query(`DELETE FROM Install WHERE id = ?`, [object.id], (err) =>
      err ? reject(err) : resolve(true)
    );
  });
};
Install.deleteAllAsync = async function (objs) {
  try {
    for (const obj of objs) await Install.deleteOneAsync(obj.id);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};
module.exports = Install;
