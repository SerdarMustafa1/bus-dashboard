const Joi = require("@hapi/joi");

const Activity = require("../../../models/mysql/activity");
const Installer = require("../../../models/mysql/installer");
const installer_dyn = require("../dynamic").installer;
const installerObject_dyn = require("../dynamic").installerObject;
const userObject_dyn = require("../dynamic").userObject;
const installers_dyn = require("../dynamic").installers;

const {
  AuthCheck,
  PermissionCheck,
  SchemaValidator,
} = require("../util/error");

const { SQLRowAsync } = require("../../../models/queryTools");
// const ActivityTypes = require("../../../models/activityTypes");
// Todo: Add activity
const sql = require("../../../db");

const { joi_id, joi_idOpt } = require("../util/check");

const installerCreateSchema = Joi.object({
  user: joi_id,
  team: joi_id,
  creator: joi_idOpt,
});

const installerRemoveSchema = Joi.object({
  _id: joi_id,
  user: joi_idOpt,
});

module.exports = {
  installer: async (args, req) => {
    PermissionCheck(req, [1, 3, 5, 11]);
    const { _id } = args;
    return installer_dyn(_id, req);
  },
  installers: async (args, req) => {
    PermissionCheck(req, [1, 3, 5, 11]);
    return installers_dyn({}, req);
  },
  installersValid: async (args, req) => {
    PermissionCheck(req, [1, 3, 5, 11]);
    return (
      await new Promise((resolve) => {
        sql.query(
          "SELECT u.* FROM User u LEFT JOIN Installer i ON (u._id = i.user_id) WHERE role=0 AND (i._id IS NULL OR i.isActive=0)",
          [],
          (err, data) => {
            if (err) resolve([]);
            else resolve(data);
          }
        );
      })
    ).map((user) => userObject_dyn(user, req));
  },
  installerMe: async (args, req) => {
    AuthCheck(req);
    try {
      const installer = await SQLRowAsync("Installer", {
        user_id: req.userId,
        isActive: 1,
      });
      if (!installer) return null;
      return installerObject_dyn(installer, req);
    } catch (err) {
      console.log(err);
      return null;
    }
  },
  installerCreate: async (args, req) => {
    PermissionCheck(req, [1, 3, 5]);
    try {
      const data = SchemaValidator(installerCreateSchema, {
        ...args,
        creator: req.userId,
      });
      const object = await SQLRowAsync("Installer", {
        user_id: data.user,
        team_id: data.team,
      });
      if (object) {
        if (object.isActive) return installer_dyn(object._id);
        await Installer.updateAsync(object._id, { isActive: 1 });
        return installer_dyn(object._id, req);
      }

      const res = await Installer.createAsync(
        new Installer({ user_id: data.user, team_id: data.team })
      );
      return installer_dyn(res._id);
    } catch (err) {
      console.log(err);
      return null;
    }
  },
  installerRemove: async (args, req) => {
    PermissionCheck(req, [1, 3, 5]);
    try {
      const data = SchemaValidator(installerRemoveSchema, {
        ...args,
        user: req.userId,
      });
      const object = await SQLRowAsync("Installer", { _id: data._id });
      if (!object) return null;

      const installs = await SQLRowAsync("Install", { installer_id: data._id });
      if (installs) {
        await Installer.updateAsync(object._id, { isActive: 0 });
        return true;
      }
      const removes = await SQLRowAsync("Remove", { installer_id: data._id });
      if (removes) {
        await Installer.updateAsync(object._id, { isActive: 0 });
        return true;
      }
      await Installer.deleteOneAsync(object._id);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
};
