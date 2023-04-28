const CampaignCity = require('./campaignCity');
const Activity = require('./activity');
const Install = require('./install');
const Remove = require('./remove');
const Placement = require('./placement');
const Picture = require('./picture');
const InstallOrder = require('./installOrder');

const sql = require('../../db.js');
const shortId = require('shortid');
const {
  filter: queryFilter,
  skipLimit,
  SQLTableAsync,
  SQLRowAsync,
} = require('../queryTools');

//Campaign object constructor
const Campaign = function (campaign) {
  this._id = shortId();

  this.name = campaign.name;
  this.client_id = campaign.client_id;
  this.creator_id = campaign.creator_id;
  this.budget = campaign.budget;
  this.priority = campaign.priority;

  this.startDate = campaign.startDate;
  this.endDate = campaign.endDate;
};

Campaign.create = function (object, cb) {
  sql.query('INSERT INTO Campaign set ?', object, function (err) {
    if (err) {
      console.log('error: ', err);
      cb(err, null);
    } else {
      cb(null, object);
    }
  });
};
Campaign.createAsync = async function (object) {
  return new Promise((resolve, reject) => {
    sql.query('INSERT INTO Campaign set ?', object, function (err) {
      if (err) {
        console.log('error: ', err);
        reject(err);
      } else {
        resolve(object);
      }
    });
  });
};
Campaign.getById = function (id, result, select) {
  sql.query(
    `SELECT ${select ? select : '*'} FROM Campaign WHERE _id = ? LIMIT 1`,
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
Campaign.getByIdAsync = function (id, select) {
  return new Promise((resolve, reject) => {
    sql.query(
      `SELECT ${select ? select : '*'} FROM Campaign WHERE _id = ? LIMIT 1`,
      id,
      function (err, res) {
        if (err) {
          console.log('error: ', err);
          return reject(err);
        }
        if (res.length > 0) resolve(res[0]);
        else resolve(null);
      }
    );
  });
};
Campaign.getAll = function (result, options) {
  const select = options ? options.select : null;
  sql.query(
    `Select ${select ? select : '*'} from Campaign ${skipLimit(options)}`,
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
Campaign.getAllAsync = async function (options) {
  const select = options ? options.select : null;
  return new Promise((resolve, reject) => {
    sql.query(
      `Select ${select ? select : '*'} from Campaign ${skipLimit(
        options
      )} WHERE isDeleted = 0`,
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
Campaign.update = (id, object, cb) => {
  object._id = undefined;
  sql.query(
    `UPDATE Campaign SET ? WHERE _id = ?`,
    [object, id],
    (err, data) => {
      if (err) return cb(err, null);
      object._id = id;
      cb(null, object);
    }
  );
};
Campaign.updateAsync = (id, object) => {
  delete object._id;
  return new Promise((resolve, reject) => {
    sql.query(
      `UPDATE Campaign SET ? WHERE _id = ?`,
      [object, id],
      (err, data) => {
        if (err) reject(err);
        object._id = id;
        resolve(object);
      }
    );
  });
};
Campaign.getAllActiveAsync = async (filter, options) => {
  const select = options ? options.select : null;
  return await new Promise((resolve, reject) => {
    sql.query(
      `SELECT ${
        select ? select : '*'
      } FROM Campaign WHERE startDate <= ? AND endDate >= ?`,
      [new Date(), new Date()],
      (err, data) => {
        if (err) return reject(err);
        return resolve(data);
      }
    );
  });
};
Campaign.deleteOneAsync = async (id) => {
  if (!shortId.isValid(id)) return false;
  const object = await SQLRowAsync('Campaign', { _id: id }, '_id');
  if (!object) return null;

  const pictures = await SQLTableAsync(
    'Picture',
    { campaign_id: object._id },
    'id'
  );
  await Picture.deleteAllAsync(pictures);

  const orders = await SQLTableAsync(
    'InstallOrder',
    { campaign_id: object._id },
    'placement_id, team_id'
  );
  await InstallOrder.deleteAllAsync(orders);

  const installs = await SQLTableAsync(
    'Install',
    { campaign_id: object._id },
    'id'
  );
  await Install.deleteAllAsync(installs);

  const removes = await SQLTableAsync(
    'Remove',
    { campaign_id: object._id },
    'id'
  );
  await Remove.deleteAllAsync(removes);

  const placements = await SQLTableAsync(
    'Placement',
    { campaign_id: object._id },
    '_id'
  );
  await Placement.deleteAllAsync(placements);

  await new Promise((resolve, reject) => {
    sql.query(
      'DELETE FROM InstallOrder WHERE campaign_id = ?',
      [object._id],
      (err) => (err ? reject(err) : resolve(true))
    );
  });

  const campaignCities = await SQLTableAsync(
    'CampaignCity',
    { campaign_id: object._id },
    'campaign_id, city_id'
  );
  await CampaignCity.deleteAllAsync(campaignCities);

  const activities = await SQLTableAsync(
    'Activity',
    { campaign_id: object._id },
    'id'
  );
  await Activity.deleteAllAsync(activities);

  return await new Promise((resolve) => {
    sql.query(
      `DELETE FROM Campaign WHERE _id = ?`,
      [object._id],
      (err, data) => {
        console.log(err);
        if (err) resolve(false);
        else resolve(true);
      }
    );
  });
};

Campaign.deleteAllAsync = async (objs) => {
  try {
    for (const obj of objs) await Campaign.deleteOneAsync(obj._id);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

module.exports = Campaign;
