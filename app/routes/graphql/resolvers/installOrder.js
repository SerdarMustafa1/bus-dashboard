const Joi = require("@hapi/joi");

const Activity = require("../../../models/mysql/activity");
const InstallOrder = require("../../../models/mysql/installOrder");

const installOrderObject_dyn = require("../dynamic").installOrderObject;

const { SQLRowAsync } = require("../../../models/queryTools");
const ActivityTypes = require("../../../models/activityTypes");

const { PermissionCheck, SchemaValidator } = require("../util/error");

const sql = require("../../../db");

const { joi_id } = require("../util/check");

const installOrderSchema = Joi.object({
  placement: joi_id,
  team: joi_id,
  count: Joi.number().integer().positive().min(1).required(),
  user: joi_id,
});
const installOrderRemoveSchema = Joi.object({
  placement: joi_id,
  team: joi_id,
});

module.exports = {
  installOrderCreate: async (args, req) => {
    PermissionCheck(req, [1, 5, 11]);
    try {
      const data = SchemaValidator(installOrderSchema, {
        ...args,
        user: args.user || req.userId,
      });

      const placement = await SQLRowAsync(
        "Placement",
        { _id: data.placement },
        "campaign_id, count"
      );
      if (!placement || placement.count < data.count) return null;

      const ordersSum = await new Promise((resolve, reject) => {
        sql.query(
          `SELECT SUM(count) as sum FROM InstallOrder WHERE placement_id = ?`,
          [data.placement],
          (err, data) => (err ? reject(err) : resolve(data[0].sum || 0))
        );
      });

      const checkOrder = await SQLRowAsync("InstallOrder", {
        team_id: data.team,
        placement_id: data.placement,
      });
      const free =
        placement.count - (ordersSum - (checkOrder ? checkOrder.count : 0));

      if (data.count > free) return null;

      if (checkOrder) {
        if (checkOrder.count === data.count) return null;
        Activity.create(
          new Activity({
            user1_id: data.user,
            campaign_id: checkOrder.campaign_id,
            placement_id: checkOrder.placement_id,
            team_id: checkOrder.team_id,
            string1: checkOrder.count,
            string2: data.count,
            activityType: ActivityTypes.INSTALLORDER.EDIT.COUNT,
          }),
          (err) => (err ? console.log(err) : undefined)
        );
        checkOrder.count = data.count;
        await InstallOrder.updateAsync(checkOrder);
        return installOrderObject_dyn(checkOrder);
      } else {
        const object = new InstallOrder({
          team_id: data.team,
          campaign_id: placement.campaign_id,
          placement_id: data.placement,
          creator_id: data.user,
          count: data.count,
        });
        await InstallOrder.createAsync(object);

        Activity.create(
          new Activity({
            user1_id: data.user,
            campaign_id: placement.campaign_id,
            placement_id: data.placement,
            team_id: data.team,
            activityType: ActivityTypes.INSTALLORDER.NEW,
          }),
          (err) => (err ? console.log(err) : undefined)
        );

        return installOrderObject_dyn(object, req);
      }
    } catch (err) {
      console.log(err);
      return null;
    }
  },
  installOrderUpdate: async (args, req) => {
    PermissionCheck(req, [1, 5, 11]);
    try {
      const data = SchemaValidator(installOrderSchema, {
        ...args,
        user: args.user || req.userId,
      });
      const checkOrder = await SQLRowAsync("InstallOrder", {
        team_id: data.team,
        placement_id: data.placement,
      });
      if (!checkOrder || checkOrder.count === data.count) return null;

      Activity.create(
        new Activity({
          user1_id: data.user,
          campaign_id: checkOrder.campaign_id,
          placement_id: checkOrder.placement_id,
          team_id: checkOrder.team_id,
          string1: checkOrder.count,
          string2: data.count,
          activityType: ActivityTypes.INSTALLORDER.EDIT.COUNT,
        }),
        (err) => (err ? console.log(err) : undefined)
      );
      checkOrder.count = data.count;
      await InstallOrder.updateAsync(checkOrder);
      return installOrderObject_dyn(checkOrder, req);
    } catch (err) {
      console.log(err);
      return null;
    }
  },
  installOrderRemove: async (args, req) => {
    PermissionCheck(req, [1, 5, 11]);
    try {
      const data = SchemaValidator(installOrderRemoveSchema, { ...args });
      const checkOrder = await SQLRowAsync("InstallOrder", {
        team_id: data.team,
        placement_id: data.placement,
      });
      if (!checkOrder) return true;

      const any = await SQLRowAsync("Install", {
        team_id: checkOrder.team_id,
        placement_id: checkOrder.placement_id,
      });
      if (any) return false;

      return await InstallOrder.deleteOneAsync(checkOrder);
    } catch (err) {
      console.log(err);
      return false;
    }
  },
};
