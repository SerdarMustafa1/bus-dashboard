const Joi = require('@hapi/joi');

const {
  PermissionCheck,
  AuthCheck,
  SchemaValidator,
} = require('../util/error');

const Activity = require('../../../models/mysql/activity');

const { skipLimit, SQLRowAsync } = require('../../../models/queryTools');
const ActivityTypes = require('../../../models/activityTypes');

const historyObject_dyn = require('../dynamic').historyObject;

const sql = require('../../../db');

const activitiesQuerySchema = Joi.object({
  types: Joi.array().items(
    Joi.string().pattern(new RegExp('^[a-z._]+$')).required()
  ),
  skip: Joi.number().integer().required(),
  limit: Joi.number().integer().required(),
});

const vehActQuerySchema = Joi.object({
  _id: Joi.string().pattern(new RegExp('^[a-zA-Z0-9-_]{16}$')).required(),
  types: Joi.array().items(
    Joi.string().pattern(new RegExp('^[a-z._]+$')).required()
  ),
  skip: Joi.number().integer().required(),
  limit: Joi.number().integer().required(),
});

module.exports = {
  activity: async (args, req) => {
    PermissionCheck(req, [3, 5]);
    const { _id } = args;

    try {
      const result = await new Promise((resolve, reject) => {
        sql.query(
          `SELECT * FROM Activity ${
            !!_id ? 'WHERE _id = ?' : 'ORDER BY created_at DESC'
          } LIMIT 1`,
          !!_id ? [_id] : [],
          (err, data) => {
            if (err) reject(err);
            if (data.length > 0) resolve(data[0]);
            else resolve(null);
          }
        );
      });
      if (!result) return null;
      return { ...result, message: Activity.message(result) };
    } catch (err) {
      throw err;
    }
  },
  activities: async (args, req) => {
    PermissionCheck(req, [3, 5]);
    try {
      const data = SchemaValidator(activitiesQuerySchema, args);

      let results = await new Promise((resolve, reject) => {
        sql.query(
          `SELECT * FROM Activity WHERE activityType IN (?) ORDER BY created_at DESC ${skipLimit(
            { skip: data.skip, limit: data.limit }
          )}`,
          [data.types],
          (err, data) => (err ? reject(err) : resolve(data))
        );
      });

      return results.map((result) => {
        return { ...result, message: Activity.message(result) };
      });
    } catch (err) {
      console.log(err);
      return null;
    }
  },
  vehicleActivities: async (args, req) => {
    PermissionCheck(req, [3, 5]);
    // const {_id, types, skip, limit} = args;

    try {
      const data = SchemaValidator(vehActQuerySchema, args);
      let results = await new Promise((resolve, reject) => {
        sql.query(
          `SELECT * FROM Activity WHERE vehicle_id = ? AND activityType IN (?) ORDER BY created_at DESC ${skipLimit(
            { skip: data.skip, limit: data.limit }
          )}`,
          [data._id, data.types],
          (err, data) => (err ? reject(err) : resolve(data))
        );
      });
      return results.map((result) => {
        return { ...result, message: Activity.message(result) };
      });
    } catch (err) {
      console.log(err);
      return null;
    }
  },
  history: async (args, req) => {
    AuthCheck(req);

    const { skip, search } = args;
    const all = !!args.all;

    const installer = await SQLRowAsync(
      'Installer',
      { user_id: req.userId, isActive: 1 },
      'team_id'
    );
    if (!installer) return [];

    const types = [
      sql.escape(ActivityTypes.INSTALL.NEW),
      sql.escape(ActivityTypes.REMOVE.NEW),
    ];
    try {
      if (all) {
        return (
          await new Promise((resolve, reject) => {
            sql.query(
              `SELECT * FROM Activity WHERE team_id=? AND vehicle_id REGEXP ${
                search ? sql.escape(search) : '"."'
              } AND activityType IN (${types.join(
                ', '
              )}) ORDER BY created_at DESC LIMIT 6 OFFSET ?`,
              [installer.team_id, skip],
              (err, data) => {
                if (err) reject(err);
                else resolve(data);
              }
            );
          })
        ).map((history) => historyObject_dyn(history, req));
      } else {
        return (
          await new Promise((resolve, reject) => {
            sql.query(
              `SELECT * FROM Activity WHERE team_id=? AND vehicle_id REGEXP ${
                search ? sql.escape(search) : '"."'
              } AND activityType IN (${types.join(
                ', '
              )}) AND user1_id = ? ORDER BY created_at DESC LIMIT 6 OFFSET ? `,
              [installer.team_id, req.userId, skip],
              (err, data) => {
                if (err) reject(err);
                else resolve(data);
              }
            );
          })
        ).map((history) => historyObject_dyn(history, req));
      }
    } catch (e) {
      console.log(e);
      return null;
    }
  },
};
