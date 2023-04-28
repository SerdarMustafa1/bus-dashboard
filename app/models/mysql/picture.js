const sql = require('../../db.js');
const {
  filter: queryFilter,
  skipLimit,
  SQLRowAsync,
} = require('../queryTools');

const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const getS3Key = (path) => path.split('/').slice(3).join('/');

//Picture object constructor
const Picture = function (picture) {
  this.user_id = picture.user_id;
  this.campaign_id = picture.campaign_id;
  this.path = picture.path;
  this.thumbnail = picture.thumbnail;
};

Picture.createAsync = async function (object) {
  return new Promise((resolve, reject) => {
    sql.query('INSERT INTO Picture set ?', object, function (err) {
      if (err) return reject(err);
      else resolve(object);
    });
  });
};
Picture.getAllAsync = async function (options) {
  const select = options ? options.select : null;
  return new Promise((resolve, reject) => {
    sql.query(
      `Select ${select ? select : '*'} from Picture ${skipLimit(options)}`,
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

Picture.queryAsync = async (filter, options) => {
  const select = options ? options.select : null;
  return await new Promise((resolve, reject) => {
    sql.query(
      `SELECT ${select ? select : '*'} FROM Picture ${queryFilter(
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
Picture.updateAsync = (id, object) => {
  return new Promise((resolve, reject) => {
    sql.query(
      `UPDATE Picture SET ? WHERE _id = ?`,
      [object, id],
      (err, data) => {
        if (err) reject(err);
        resolve(object);
      }
    );
  });
};
Picture.deleteOneAsync = async function (id) {
  const object = await SQLRowAsync('Picture', { id });
  if (!object) return null;

    for (const path of [object.path, object.thumbnail]) {
        if (!path) continue;
        s3.deleteObject({
            Bucket: 'busdashboard',
            Key: getS3Key(path)
        }, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
        });
    }

  return await new Promise((resolve, reject) => {
    sql.query(`DELETE FROM Picture WHERE id = ?`, [object.id], (err) =>
      err ? reject(err) : resolve(true)
    );
  });
};

Picture.deleteAllAsync = async function (objs) {
  try {
    for (const obj of objs) await Picture.deleteOneAsync(obj.id);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

module.exports = Picture;
