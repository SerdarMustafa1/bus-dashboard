const placementsForInstallers_dyn = require('../dynamic')
  .placementsForInstallers;

const Joi = require('@hapi/joi');
const { SQLRowAsync } = require('../../../models/queryTools');
// const sql = require('../../../db');

const { AuthCheck, SchemaValidator } = require('../util/error');

const { joi_id } = require('../util/check');

const placementsSearchSchema = Joi.object({
  _id: joi_id,
  user: joi_id,
});

module.exports = {
  placementsForInstaller: async (args, req) => {
    AuthCheck(req);
    const data = SchemaValidator(placementsSearchSchema, {
      ...args,
      user: req.userId,
    });
    const installer = await SQLRowAsync(
      'Installer',
      { user_id: data.user, isActive: 1 },
      'team_id'
    );
    if (!installer) return [];
    return placementsForInstallers_dyn(
      { _id: data._id, team_id: installer.team_id },
      req
    );
  },
};
