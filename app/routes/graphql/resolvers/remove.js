const Joi = require('@hapi/joi');

const Activity = require('../../../models/mysql/activity');
const Remove = require('../../../models/mysql/remove');
const Install = require('../../../models/mysql/install');
const remove_dyn = require('../dynamic').remove;

const { AuthCheck, SchemaValidator } = require('../util/error');

const { SQLTableAsync, SQLRowAsync } = require('../../../models/queryTools');
const ActivityTypes = require('../../../models/activityTypes');

const sql = require('../../../db');

const { joi_id, joiVehicle, joi_idOpt } = require('../util/check');

const removeInstallsSchema = Joi.object({
  vehicle: joiVehicle,
  placement: joi_id,
  installer: joi_idOpt,
  user: joi_id,
});

const checkFleetAdds = async function (vehicle_id) {
  sql.query(
    'UPDATE Vehicle SET totalAds = coalesce((SELECT SUM(count) FROM Install WHERE vehicle_id=? AND installed=1),0), haveAds = totalAds>0 WHERE _id=?',
    [vehicle_id, vehicle_id],
    (err) => (err ? console.log(err) : undefined)
  );
};

const checkPlacementPublic = async function (placement_id) {
  sql.query(
    'UPDATE Placement SET isPublic = (SELECT count(_id)>0 FROM Install WHERE placement_id = ? LIMIT 1) WHERE _id=?',
    [placement_id, placement_id],
    (err) => (err ? console.log(err) : undefined)
  );
};

module.exports = {
  removeAd: async (args, req) => {
    AuthCheck(req);
    try {
      const data = SchemaValidator(removeInstallsSchema, {
        ...args,
        installer: req.installerId,
        user: req.userId,
      });

      let isInstaller;
      if (data.installer)
        isInstaller = await SQLRowAsync(
          'Installer',
          { _id: data.installer, isActive: 1 },
          '_id, team_id, user_id'
        );
      else
        isInstaller = await SQLRowAsync(
          'Installer',
          { user_id: data.user, isActive: 1 },
          '_id, team_id, user_id'
        );

      const isPlacement = await SQLRowAsync(
        'Placement',
        { _id: data.placement },
        '_id, count, campaign_id'
      );
      const isVehicle = await SQLRowAsync(
        'Vehicle',
        { _id: data.vehicle },
        '_id'
      );
      if (!isPlacement || !isVehicle || !isInstaller) return 0;

      const installs = await SQLTableAsync(
        'Install',
        {
          placement_id: isPlacement._id,
          vehicle_id: isVehicle._id,
          installed: 1,
        },
        'id, count, created_at'
      );
      if (installs.length <= 0) return 0;

      let removed = false;
      let c = 0;
      for (const ins of installs) {
        if (
          new Date(ins.created_at).getTime() + 86400000 >
          new Date().getTime()
        ) {
          c += ins.count;
          await Install.deleteOneAsync(ins.id);
          removed = true;
        }
      }
      if (removed) {
        checkFleetAdds(isVehicle._id);
        checkPlacementPublic(isPlacement._id);
        return c;
      }

      let count = 0;
      for (const inst of installs) count += inst.count;
      if (count <= 0) return 0;

      const object = new Remove({
        vehicle_id: isVehicle._id,
        placement_id: isPlacement._id,
        campaign_id: isPlacement.campaign_id,
        installer_id: isInstaller._id,
        count,
      });
      const save = await Remove.createAsync(object);

      Activity.create(
        new Activity({
          user1_id: isInstaller.user_id,
          team_id: isInstaller.team_id,
          vehicle_id: isVehicle._id,
          placement_id: isPlacement._id,
          campaign_id: isPlacement.campaign_id,
          remove_id: save.id,
          activityType: ActivityTypes.REMOVE.NEW,
        }),
        (err) => (err ? console.log(err) : undefined)
      );

      // ALL CHECKS AND BOOLEANS
      for (const install of installs)
        Install.update(
          install.id,
          { installed: 0, remove_id: save.id },
          (err) => (err ? console.log(err) : undefined)
        );

      checkFleetAdds(isVehicle._id);
      checkPlacementPublic(isPlacement._id);

      return count;
    } catch (err) {
      console.log(err);
      return null;
    }
  },
};
