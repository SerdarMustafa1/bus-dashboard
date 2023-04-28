const shortId = require('shortid');
const Joi = require('@hapi/joi');

const Vehicle = require('../../../models/mysql/vehicle');
const Activity = require('../../../models/mysql/activity');

const vehicle_dyn = require('../dynamic').vehicle;
const vehicles_dyn = require('../dynamic').vehicles;
const vehicleObject_dyn = require('../dynamic').vehicleObject;
const removes_dyn = require('../dynamic').removes;
const installs_dyn = require('../dynamic').installs;
const placementObject_dyn = require('../dynamic').placementObject;
const campaignObject_dyn = require('../dynamic').campaignObject;

const { AuthCheck, SchemaValidator } = require('../util/error');

const { skipLimit } = require('../../../models/queryTools');
const sql = require('../../../db');
const ActivityTypes = require('../../../models/activityTypes');

const { joiVehicle } = require('../util/check');

const vehicleEditSchema = Joi.object({
  vehicle: joiVehicle,
  numberPlate: Joi.string().min(4).required(),
});

const vehicleSearchSchema = Joi.object({
  search: Joi.string().allow('').pattern(new RegExp('^[a-zA-Z0-9-_]*$')),
  skip: Joi.number().integer(),
  active: Joi.boolean(),
});

const vehicleSearchSchema2 = Joi.object({
  search: Joi.string().allow('').pattern(new RegExp('^[a-zA-Z0-9-_]*$')),
  skip: Joi.number().integer(),
});

module.exports = {
  vehicle: async (args, req) => {
    AuthCheck(req);
    const { _id } = args;
    return vehicle_dyn(_id, req);
  },
  vehiclesForInstallers: async (args, req) => {
    AuthCheck(req);

    try {
      const data = SchemaValidator(vehicleSearchSchema, args);

      const filter = [' listed=1 '];
      if (data.search) filter.push(' _id REGEXP ' + sql.escape(data.search));
      if (data.active !== undefined)
        filter.push(` haveAds = ${data.active ? 1 : 0}`);

      return (
        await new Promise((resolve, reject) => {
          sql.query(
            `SELECT * FROM Vehicle ${
              filter.length ? ` WHERE ${filter.join(' AND ')}` : ''
            } ${skipLimit({ data: data.skip, limit: 12 })};`,
            [],
            (err, data) => {
              if (err) reject(err);
              else resolve(data);
            }
          );
        })
      ).map((camp) => vehicleObject_dyn(camp, req));
    } catch (e) {
      return [];
    }
  },
  activeVehicles: async (args, req) => {
    AuthCheck(req);

    try {
      const data = SchemaValidator(vehicleSearchSchema2, args);

      return (
        await new Promise((resolve, reject) => {
          sql.query(
            `SELECT * FROM Vehicle WHERE haveAds=1 AND _id REGEXP ${
              data.search ? sql.escape(data.search) : '"."'
            } ${skipLimit({ skip: data.skip, limit: 12 })};`,
            [],
            (err, data) => {
              if (err) reject(err);
              else resolve(data);
            }
          );
        })
      ).map((camp) => vehicleObject_dyn(camp, req));
    } catch (e) {
      console.log(e);
      return null;
    }
  },

  // IMPORTANT TO RECREATE
  vehicleCampaigns: async (args, req) => {
    AuthCheck(req);
    const { _id } = args;
    try {
      return (
        await new Promise((resolve, reject) => {
          sql.query(
            `SELECT * FROM Campaign WHERE _id IN (
      SELECT campaign_id FROM Install WHERE vehicle_id = ? AND installed = 1);`,
            [_id],
            (err, data) => {
              if (err) reject(err);
              else resolve(data);
            }
          );
        })
      ).map((camp) => campaignObject_dyn(camp, req));
    } catch (err) {
      console.log(err);
      return null;
    }
  },
  vehicleInstalls: async (args, req) => {
    AuthCheck(req);
    const { _id } = args;
    const query = { vehicle_id: _id, installed: 1 };
    return installs_dyn(query, req);
  },

  vehicleUpdate: async (args, req) => {
    AuthCheck(req);

    try {
      const data = SchemaValidator(vehicleEditSchema, args);

      const object = await Vehicle.getByIdAsync(data._id);
      if (!object) return null;

      Activity.create(
        new Activity({
          user1_id: req.userId,
          vehicle_id: object,
          string1: object.numberPlate,
          string2: data.numberPlate,
          activityType: ActivityTypes.FLEET.EDIT.NUMBERPLATE,
        }),
        (err) => {
          console.log(err);
        }
      );
      object.numberPlate = data.numberPlate;
      Vehicle.update(object._id, object, (err) =>
        err ? console.log(err) : undefined
      );

      return { ...object };
    } catch (err) {
      console.log(err);
      return null;
    }
  },
};
