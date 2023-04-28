const Activity = require('./activity');
const Install = require('./install');
const Remove = require('./remove');
const Picture = require('./picture');

const sql = require('../../db.js');
const shortId = require('shortid');
const {
  filter: queryFilter,
  skipLimit,
  SQLTableAsync,
  SQLRowAsync,
} = require('../queryTools');

//Placement object constructor
const Placement = function (placement) {
  console.log('Creating new Placement!');
  this._id = shortId();

  this.place_id = placement.place_id;
  this.campaign_id = placement.campaign_id;
  this.count = placement.count;
};

Placement.create = function (object, cb) {
  sql.query('INSERT INTO Placement set ?', object, function (err) {
    if (err) {
      console.log('error: ', err);
      cb(err, null);
    } else {
      cb(null, object);
    }
  });
};
Placement.getById = function (id, result, select) {
  sql.query(
    `SELECT ${select ? select : '*'} FROM Placement WHERE _id = ? LIMIT 1`,
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
Placement.getAll = function (result, options) {
  const select = options ? options.select : null;
  sql.query(
    `Select ${select ? select : '*'} from Placement ${skipLimit(options)}`,
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
Placement.getAllAsync = async function (options) {
  const select = options ? options.select : null;
  return new Promise((resolve, reject) => {
    sql.query(
      `Select ${select ? select : '*'} from Placement ${skipLimit(options)}`,
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
Placement.query = (filter, cb, options) => {
  const select = options ? options.select : null;
  sql.query(
    `SELECT ${select ? select : '*'} FROM Placement ${queryFilter(
      filter
    )} ${skipLimit(options)}`,
    null,
    (err, data) => {
      if (err) cb(err, null);
      cb(null, data);
    }
  );
};
Placement.queryAsync = async (filter, options) => {
  const select = options ? options.select : null;
  return await new Promise((resolve, reject) => {
    sql.query(
      `SELECT ${select ? select : '*'} FROM Placement ${queryFilter(
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
Placement.update = (id, object, cb) => {
  delete object._id;
  sql.query(
    `UPDATE Placement SET ? WHERE _id = ?`,
    [object, id],
    (err, data) => {
      if (err) return cb(err, null);
      object._id = id;
      cb(null, object);
    }
  );
};
Placement.updateAsync = (id, object) => {
  delete object._id;
  return new Promise((resolve, reject) => {
    sql.query(
      `UPDATE Placement SET ? WHERE _id = ?`,
      [object, id],
      (err, data) => {
        if (err) reject(err);
        object._id = id;
        resolve(object);
      }
    );
  });
};
Placement.deleteOneAsync = async function (_id) {
  if (!shortId.isValid(_id)) return false;

  const object = await SQLRowAsync('Placement', { _id }, '_id');
  if (!object) return null;

  const installs = await SQLTableAsync(
    'Install',
    { placement_id: object._id },
    'id'
  );
  await Install.deleteAllAsync(installs);

  const removes = await SQLTableAsync(
    'Remove',
    { placement_id: object._id },
    'id'
  );
  await Remove.deleteAllAsync(removes);

  const activities = await SQLTableAsync(
    'Activity',
    { placement_id: object._id },
    'id'
  );
  await Activity.deleteAllAsync(activities);

  return await new Promise((resolve, reject) => {
    sql.query(`DELETE FROM Placement WHERE _id = ?`, [object._id], (err) =>
      err ? reject(err) : resolve(true)
    );
  });
};

Placement.deleteAllAsync = async function (objs) {
  try {
    for (const obj of objs) await Placement.deleteOneAsync(obj._id);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};
module.exports = Placement;
