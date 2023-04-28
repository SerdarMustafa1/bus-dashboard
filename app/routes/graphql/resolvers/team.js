const Joi = require('@hapi/joi');
const shortId = require('shortid');

const Team = require('../../../models/mysql/team');
const Activity = require('../../../models/mysql/activity');

const team_dyn = require('../dynamic').team;
const teams_dyn = require('../dynamic').teams;
const teamObject_dyn = require('../dynamic').teamObject;

const {
  AuthCheck,
  PermissionCheck,
  SchemaValidator,
} = require('../util/error');

const sql = require('../../../db');
const { SQLRowAsync } = require('../../../models/queryTools');
const ActivityTypes = require('../../../models/activityTypes');

const { joi_id } = require('../util/check');
const teamCreateSchema = Joi.object({
  company: Joi.string().required(),
  user: joi_id,
});
const teamEditSchema = Joi.object({
  _id: joi_id,
  company: Joi.string().min(3).max(255).required(),
  user: joi_id,
});

module.exports = {
  team: async (args, req) => {
    AuthCheck(req);
    const { _id } = args;
    if (!shortId.isValid(_id)) return null;
    return team_dyn(_id, req);
  },
  teams: async (args, req) => {
    AuthCheck(req);
    return teams_dyn({}, req);
  },
  teamCreate: async (args, req) => {
    PermissionCheck(req, [1, 5, 11]);
    try {
      const data = SchemaValidator(teamCreateSchema, {
        ...args,
        user: req.userId,
      });
      const checkTeam = await SQLRowAsync(
        'Team',
        { company: data.company },
        '_id'
      );
      if (checkTeam) return null;

      const object = new Team({
        company: data.company,
      });
      await Team.createAsync(object);
      Activity.create(
        new Activity({
          user1_id: data.user,
          team_id: object._id,
          activityType: ActivityTypes.TEAM.NEW,
        }),
        (err) => (err ? console.log(err) : undefined)
      );
      return teamObject_dyn(object, req);
    } catch (err) {
      console.log(err);
      return null;
    }
  },
  teamUpdate: async (args, req) => {
    PermissionCheck(req, [1, 5, 11]);
    try {
      const data = SchemaValidator(teamEditSchema, {
        ...args,
        user: req.userId,
      });

      const object = await SQLRowAsync('Team', { _id: data._id });
      if (!object) return null;

      if (data.company !== object.company) {
        Activity.create(
          new Activity({
            user1_id: data.user,
            team_id: object._id,
            string1: object.company,
            string2: data.company,
            activityType: ActivityTypes.TEAM.EDIT.COMPANY,
          }),
          (err) => (err ? console.log(err) : undefined)
        );

        object.company = data.company;
      }
      await Team.updateAsync(object._id, object);
      return teamObject_dyn(object, req);
    } catch (err) {
      console.log(err);
      return null;
    }
  },
  teamDelete: async (args, req) => {
    PermissionCheck(req, [10]);
    const { _id } = args;
    if (shortId.isValid(_id)) return null;

    try {
      const object = await SQLRowAsync('Team', { _id, isDeleted: 0 }, '_id');
      if (!object) return null;

      await Team.updateAsync(object._id, { isDeleted: 1 });

      Activity.create(
        new Activity({
          user1_id: req.userId,
          team_id: object._id,
          activityType: ActivityTypes.TEAM.HIDE,
        }),
        (err) => (err ? console.log(err) : undefined)
      );

      return { ...object };
    } catch (err) {
      console.log(err);
      return null;
    }
  },
  teamHardDelete: async (args, req) => {
    PermissionCheck(req, [5, 11]);
    const { _id } = args;
    try {
      return await Team.deleteOneAsync(_id);
    } catch (err) {
      console.log(err);
      return null;
    }
  },
};
