const Activity = require('./activity');
const sql = require('../../db.js');
const {
  filter: queryFilter,
  skipLimit,
  SQLTableAsync,
  SQLRowAsync,
} = require('../queryTools');

//Remove object constructor
const Remove = function (remove) {
  this.vehicle_id = remove.vehicle_id;
  this.placement_id = remove.placement_id;
  this.installer_id = remove.installer_id;
  this.campaign_id = remove.campaign_id;
  this.count = remove.count;
};
Remove.createAsync = async function (remove) {
  return new Promise((resolve, reject) => {
    sql.query('INSERT INTO Remove set ?', remove, function (err, data) {
      if (err) return reject(err);
      remove.id = data.insertId;
      resolve(remove);
    });
  });
};
Remove.queryAsync = async (filter, options) => {
  const select = options ? options.select : null;
  return await new Promise((resolve, reject) => {
    sql.query(
      `SELECT ${select ? select : '*'} FROM Remove ${queryFilter(
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
Remove.updateAsync = (id, object) => {
  delete object._id;
  return new Promise((resolve, reject) => {
    sql.query(`UPDATE Remove SET ? WHERE id = ?`, [object, id], (err, data) => {
      if (err) reject(err);
      object._id = id;
      resolve(object);
    });
  });
};
Remove.deleteOneAsync = async function (id) {
  const object = await SQLRowAsync('Remove', { id }, 'id');
  if (!object) return null;

  const activities = await SQLTableAsync(
    'Activity',
    { remove_id: object.id },
    'id'
  );
  await Activity.deleteAllAsync(activities);

  return await new Promise((resolve, reject) => {
    sql.query(`DELETE FROM Remove WHERE id = ?`, [object.id], (err) =>
      err ? reject(err) : resolve(true)
    );
  });
};
Remove.deleteAllAsync = async function (objs) {
  try {
    for (const obj of objs) await Remove.deleteOneAsync(obj.id);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};
module.exports = Remove;
