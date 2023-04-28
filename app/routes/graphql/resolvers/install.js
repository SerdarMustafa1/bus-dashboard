const Joi = require("@hapi/joi");

const Activity = require("../../../models/mysql/activity");
const Install = require("../../../models/mysql/install");
const InstallOrder = require("../../../models/mysql/installOrder");
const Vehicle = require("../../../models/mysql/vehicle");
const Placement = require("../../../models/mysql/placement");

const { SQLRowAsync } = require("../../../models/queryTools");
const ActivityTypes = require("../../../models/activityTypes");

const { AuthCheck, SchemaValidator } = require("../util/error");

const sql = require("../../../db");

const { joi_id, joiVehicle, joi_idOpt } = require("../util/check");

const installCreateSchema = Joi.object({
  vehicle: joiVehicle,
  placement: joi_id,
  count: Joi.number().integer().positive().min(1).required(),
  installer: joi_idOpt,
  user: joi_id,
});

module.exports = {
  installAd: async (args, req) => {
    AuthCheck(req);

    try {
      const data = SchemaValidator(installCreateSchema, {
        ...args,
        installer: req.installerId,
        user: req.userId,
      });
      let isInstaller;
      if (data.installer)
        isInstaller = await SQLRowAsync(
          "Installer",
          { _id: data.installer, isActive: 1 },
          "_id, team_id, user_id"
        );
      else
        isInstaller = await SQLRowAsync(
          "Installer",
          { user_id: data.user, isActive: 1 },
          "_id, team_id, user_id"
        );

      const isVehicle = await SQLRowAsync(
        "Vehicle",
        { _id: data.vehicle, listed: 1 },
        "_id, totalAds"
      );
      const isPlacement = await SQLRowAsync(
        "Placement",
        { _id: data.placement },
        "_id, count, campaign_id"
      );
      if (!isPlacement || !isVehicle || !isInstaller) return false;

      const installOrder = await SQLRowAsync(
        "InstallOrder",
        { placement_id: isPlacement._id, team_id: isInstaller.team_id },
        "placement_id, team_id, count, is_installed, is_removed"
      );
      if (!installOrder) return false;

      const sum = await new Promise((resolve, reject) => {
        sql.query(
          "SELECT SUM(count) AS sum FROM Install WHERE team_id = ? AND placement_id = ? AND installed = 1",
          [isInstaller.team_id, isPlacement._id],
          (err, data) => {
            if (err) reject(err);
            if (data && data.length > 0) {
              const sum = data[0].sum;
              resolve(sum ? sum : 0);
            } else resolve(0);
          }
        );
      });
      if (sum + data.count > installOrder.count) return false;

      const object = new Install({
        vehicle_id: isVehicle._id,
        placement_id: isPlacement._id,
        campaign_id: isPlacement.campaign_id,
        team_id: isInstaller.team_id,
        installer_id: isInstaller._id,
        count: data.count,
      });

      const saved = await Install.createAsync(object);

      Vehicle.update(
        isVehicle._id,
        {
          haveAds: 1,
          totalAds: isVehicle.totalAds
            ? isVehicle.totalAds + data.count
            : data.count,
        },
        (err) => (err ? console.log(err) : undefined)
      );

      isPlacement.isPublic = 1;
      Placement.update(isPlacement._id, isPlacement, (err) =>
        err ? console.log(err) : undefined
      );

      if (installOrder.is_removed === 1) {
        installOrder.is_removed = 0;
        InstallOrder.updateAsync(installOrder);
      }
      if (sum + data.count === installOrder.count) {
        installOrder.is_installed = 1;
        InstallOrder.updateAsync(installOrder);
      }
      Activity.create(
        new Activity({
          user1_id: isInstaller.user_id,
          vehicle_id: isVehicle._id,
          placement_id: isPlacement._id,
          campaign_id: isPlacement.campaign_id,
          team_id: isInstaller.team_id,
          install_id: saved.id,
          activityType: ActivityTypes.INSTALL.NEW,
        }),
        (err) => (err ? console.log(err) : undefined)
      );

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
};
