const Joi = require('@hapi/joi');

const Activity = require('../../../models/mysql/activity');
const Operator = require('../../../models/mysql/operator');
const operator_dyn = require('../dynamic').operator;
const vehicles_dyn = require('../dynamic').vehicles;
const vehicleObject_dyn = require('../dynamic').vehicleObject;

const { PermissionCheck, SchemaValidator } = require('../util/error');

const { SQLRowAsync } = require('../../../models/queryTools');
const ActivityTypes = require('../../../models/activityTypes');

const sql = require('../../../db');

const { joi_id } = require('../util/check');

const context = require('../../../workers/fleet_modules/context');

const operatorEditSchema = Joi.object({
  _id: joi_id,
  company: Joi.string().min(3),
  listed: Joi.boolean(),
  visible: Joi.boolean(),
});

module.exports = {
  operator: async (args, req) => {
    PermissionCheck(req, [3, 5]);
    const { _id } = args;
    return operator_dyn(_id, req);
  },
  operatorVehicles: async (args, req) => {
    PermissionCheck(req, [1, 3, 5]);
    const { _id } = args;
    const query = { operator_id: _id };
    if ([5, 11].includes(req.userRole)) {
      const results = await new Promise((resolve) => {
        sql.query(
          `SELECT _id, haveAds, numberPlate, city_id, operator_id, listed, totalAds FROM Vehicle 
        WHERE operator_id = ? AND (listed = 1 OR visible = 1)`,
          [_id],
          (err, data) => resolve(err ? [] : data)
        );
      });
      return results.map((result) => vehicleObject_dyn(result, req));
    }
    return vehicles_dyn(query, req);
  },
  operatorUpdate: async (args, req) => {
    PermissionCheck(req, [5, 11]);

    try {
      const data = SchemaValidator(operatorEditSchema, args);
      const object = await SQLRowAsync('Operator', { _id: data._id });
      const city = await SQLRowAsync('City', { _id: object.city_id }, 'short');
      if (!object || !city) return null;

      if (data.company !== undefined && data.company !== object.company) {
        Activity.create(
          new Activity({
            user1_id: req.userId,
            operator_id: object._id,
            string1: object.company,
            string2: data.company,
            activityType: ActivityTypes.OPERATOR.EDIT.COMPANY,
          }),
          (err) => (err ? console.log(err) : undefined)
        );
        object.company = data.company;
      }

      if (data.listed !== undefined && !!data.listed !== !!object.listed) {
        Activity.create(
          new Activity({
            user1_id: req.userId,
            operator_id: object._id,
            string1: object.listed.toString(),
            string2: data.listed.toString(),
            activityType: ActivityTypes.OPERATOR.EDIT.LISTED,
          }),
          (err) => (err ? console.log(err) : undefined)
        );
        object.listed = data.listed ? 1 : 0;
        object.visible = object.listed;

        context.operators[city.short + object.operatorId].listed =
          object.listed;
        context.operators[city.short + object.operatorId].visible =
          object.listed;

        sql.query(
          'UPDATE Vehicle SET listed = ?, visible = ? WHERE operator_id = ?',
          [data.listed, data.listed, object._id],
          (err) => {
            if (err) console.log(err);
          }
        );
      }
      if (data.visible !== undefined && !!data.visible !== !!object.visible) {
        Activity.create(
          new Activity({
            user1_id: req.userId,
            operator_id: object._id,
            string1: object.visible.toString(),
            string2: data.visible.toString(),
            activityType: ActivityTypes.OPERATOR.EDIT.VISIBLE,
          }),
          (err) => (err ? console.log(err) : undefined)
        );
        object.visible = data.visible ? 1 : 0;
        context.operators[city.short + object.operatorId].visible =
          object.visible;

        sql.query(
          'UPDATE Vehicle SET visible = ? WHERE operator_id = ?',
          [object.visible, object._id],
          (err) => {
            if (err) console.log(err);
          }
        );
      }
      const res = await Operator.updateAsync(object._id, object);
      return { ...res };
    } catch (err) {
      console.log(err);
      return null;
    }
  },
};
