const sql = require('../../db.js');
const shortId = require('shortid');
const { filter: queryFilter, skipLimit } = require('../queryTools');

//CampaignCity object constructor
const CampaignCity = function (campaignCity) {
  this.campaign_id = campaignCity.campaign_id;
  this.city_id = campaignCity.city_id;
};

CampaignCity.create = function (object, cb) {
  sql.query('INSERT INTO CampaignCity set ?', object, function (err) {
    if (err) {
      console.log('error: ', err);
      cb(err, null);
    } else {
      cb(null, object);
    }
  });
};
CampaignCity.createAsync = async function (object) {
  return new Promise((resolve, reject) => {
    sql.query('INSERT INTO CampaignCity set ?', object, function (err) {
      if (err) {
        console.log('error: ', err);
        reject(err);
      } else {
        resolve(object);
      }
    });
  });
};
CampaignCity.getById = function (camp_id, city_id, result, select) {
  sql.query(
    `SELECT ${
      select ? select : '*'
    } FROM CampaignCity WHERE campaign_id = ? AND city_id = ? LIMIT 1`,
    [camp_id, city_id],
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
CampaignCity.getAll = function (result, options) {
  const select = options ? options.select : null;
  sql.query(
    `Select ${select ? select : '*'} from CampaignCity ${skipLimit(options)}`,
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
CampaignCity.getAllAsync = async function (options) {
  const select = options ? options.select : null;
  return new Promise((resolve, reject) => {
    sql.query(
      `Select ${select ? select : '*'} from CampaignCity ${skipLimit(options)}`,
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
CampaignCity.query = (filter, cb, options) => {
  const select = options ? options.select : null;
  sql.query(
    `SELECT ${select ? select : '*'} FROM CampaignCity ${queryFilter(
      filter
    )} ${skipLimit(options)}`,
    null,
    (err, data) => {
      if (err) cb(err, null);
      cb(null, data);
    }
  );
};
CampaignCity.queryAsync = async (filter, options) => {
  const select = options ? options.select : null;
  return await new Promise((resolve, reject) => {
    sql.query(
      `SELECT ${select ? select : '*'} FROM CampaignCity ${queryFilter(
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

CampaignCity.deleteOneAsync = async function (campaign_id, city_id) {
  if (!shortId.isValid(campaign_id) || !shortId.isValid(city_id)) return false;
  return await new Promise((resolve, reject) => {
    sql.query(
      `DELETE FROM CampaignCity WHERE campaign_id = ? AND city_id = ?`,
      [campaign_id, city_id],
      (err) => (err ? reject(err) : resolve(true))
    );
  });
};

CampaignCity.deleteAllAsync = async function (objs) {
  try {
    for (const obj of objs)
      await CampaignCity.deleteOneAsync(obj.campaign_id, obj.city_id);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

module.exports = CampaignCity;
