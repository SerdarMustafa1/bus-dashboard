const sql = require('../../db.js');
const { filter: queryFilter, skipLimit } = require('../queryTools');

//Vehicle object constructor
const Vehicle = function (vehicle) {
  this._id = vehicle._id;

  this.line = vehicle.line;
  this.operator_id = vehicle.operator_id;
  this.city_id = vehicle.city_id;
  this.latitude = vehicle.latitude;
  this.longitude = vehicle.longitude;
  this.haveAds = 0;
  this.listed = vehicle.listed === 0 ? 0 : 1;
  this.visible = vehicle.visible === 0 ? 0 : 1;
  console.log(
    'Creating new Vehicle: ',
    vehicle._id,
    this.listed ? '' : '(unlisted)'
  );
};

Vehicle.create = function (vehicle, cb) {
  sql.query('INSERT INTO Vehicle set ?', vehicle, function (err) {
    if (err) {
      console.log('error: ', err);
      cb(err, null);
    } else {
      cb(null, vehicle);
    }
  });
};
Vehicle.getById = function (id, result, select) {
  sql.query(
    `SELECT ${select ? select : '*'} FROM Vehicle WHERE _id = ? LIMIT 1`,
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
Vehicle.getByIdAsync = async function (id, select) {
  return new Promise((resolve, reject) => {
    sql.query(
      `SELECT ${select ? select : '*'} FROM Vehicle WHERE _id = ? LIMIT 1`,
      id,
      function (err, res) {
        if (err) {
          console.log('error: ', err);
          reject(err);
        }
        if (res.length > 0) resolve(res[0]);
        else resolve(null);
      }
    );
  });
};
Vehicle.getAll = function (result, options) {
  const select = options ? options.select : null;
  sql.query(
    `Select ${select ? select : '*'} from Vehicle ${skipLimit(options)}`,
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
Vehicle.getAllAsync = async function (options) {
  const select = options ? options.select : null;
  return new Promise((resolve, reject) => {
    sql.query(
      `Select ${select ? select : '*'} from Vehicle ${skipLimit(options)}`,
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
Vehicle.query = (filter, cb, options) => {
  const select = options ? options.select : null;
  sql.query(
    `SELECT ${select ? select : '*'} FROM Vehicle ${queryFilter(
      filter
    )} ${skipLimit(options)}`,
    null,
    (err, data) => {
      if (err) cb(err, null);
      cb(null, data);
    }
  );
};
Vehicle.queryAsync = async (filter, options) => {
  const select = options ? options.select : null;
  return await new Promise((resolve, reject) => {
    sql.query(
      `SELECT ${select ? select : '*'} FROM Vehicle ${queryFilter(
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
Vehicle.update = (id, object, cb) => {
  delete object._id;
  sql.query(`UPDATE Vehicle SET ? WHERE _id = ?`, [object, id], (err, data) => {
    if (err) return cb(err, null);
    object._id = id;
    cb(null, object);
  });
};
Vehicle.updateAsync = (id, object) => {
  delete object._id;
  return new Promise((resolve, reject) => {
    sql.query(
      `UPDATE Vehicle SET ? WHERE _id = ?`,
      [object, id],
      (err, data) => {
        if (err) reject(err);
        object._id = id;
        resolve(object);
      }
    );
  });
};
Vehicle.remove = async function (id, cb) {
  sql.query('DELETE FROM Vehicle WHERE _id = ?', [id], function (err, res) {
    if (err) return cb(false);
    cb(true);
  });
};

module.exports = Vehicle;
