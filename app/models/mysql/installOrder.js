const Activity = require('./activity');

const sql = require('../../db.js');
const shortId = require('shortid');
const {
  filter: queryFilter,
  skipLimit,
  SQLTableAsync,
  SQLRowAsync,
} = require('../queryTools');

//InstallOrder object constructor
const InstallOrder = function (install) {
  this.team_id = install.team_id;
  this.placement_id = install.placement_id;
  this.campaign_id = install.campaign_id;
  this.count = install.count;
  this.creator_id = install.creator_id;
  this.is_installed = 0;
  this.is_removed = 1;
};

InstallOrder.createAsync = async function (object) {
  return new Promise((resolve, reject) => {
    sql.query('INSERT INTO InstallOrder set ?', object, function (err) {
      if (err) reject(err);
      else resolve(object);
    });
  });
};
InstallOrder.getById = function (id, result, select) {
  sql.query(
    `SELECT ${select ? select : '*'} FROM InstallOrder WHERE _id = ? LIMIT 1`,
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
InstallOrder.getAllAsync = async function (options) {
  const select = options ? options.select : null;
  return new Promise((resolve, reject) => {
    sql.query(
      `Select ${select ? select : '*'} from InstallOrder ${skipLimit(options)}`,
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
InstallOrder.queryAsync = async (filter, options) => {
  const select = options ? options.select : null;
  return await new Promise((resolve, reject) => {
    sql.query(
      `SELECT ${select ? select : '*'} FROM InstallOrder ${queryFilter(
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
InstallOrder.updateAsync = (object) => {
  return new Promise((resolve, reject) => {
    if (!object.team_id)
      return reject(
        new Error('Cant update InstallOrder: team_id is not provided')
      );
    if (!object.placement_id)
      return reject(
        new Error('Cant update InstallOrder: placement_id is not provided')
      );
    sql.query(
      `UPDATE InstallOrder SET ? WHERE team_id = ? AND placement_id = ?`,
      [object, object.team_id, object.placement_id],
      (err, data) => {
        if (err) reject(err);
        else resolve(object);
      }
    );
  });
};
InstallOrder.deleteOneAsync = async function (installObject) {
  const object = await SQLRowAsync('InstallOrder', {
    team_id: installObject.team_id,
    placement_id: installObject.placement_id,
  });
  if (!object) return false;

  return await new Promise((resolve) => {
    sql.query(
      `DELETE FROM InstallOrder WHERE team_id = ? AND placement_id = ?`,
      [object.team_id, object.placement_id],
      (err) => resolve(!!!err)
    );
  });
};
InstallOrder.deleteAllAsync = async function (objs) {
  try {
    for (const obj of objs) await InstallOrder.deleteOneAsync(obj);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};
module.exports = InstallOrder;
