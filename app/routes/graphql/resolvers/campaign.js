const Campaign = require("../../../models/mysql/campaign");
const Placement = require("../../../models/mysql/placement");
const Place = require("../../../models/mysql/place");
const City = require("../../../models/mysql/city");
const Activity = require("../../../models/mysql/activity");
const CampaignCity = require("../../../models/mysql/campaignCity");

const Joi = require("@hapi/joi");

const sql = require("../../../db");
const { SQLTableAsync, SQLRowAsync } = require("../../../models/queryTools");
const ActivityTypes = require("../../../models/activityTypes");

const campaign_dyn = require("../dynamic").campaign;
const campaignObject_dyn = require("../dynamic").campaignObject;
const campaignForInstallersObject_dyn = require("../dynamic")
  .campaignForInstallersObject;
const vehicleObject_dyn = require("../dynamic").vehicleObject;
const campaigns_dyn = require("../dynamic").campaigns;
const installs_dyn = require("../dynamic").installs;
const pictures_dyn = require("../dynamic").pictures;

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const genPass = require("generate-password");
const shortId = require("shortid");

const {
  AuthCheck,
  PermissionCheck,
  SchemaValidator,
} = require("../util/error");
const { JWTSecret } = require("../../../config/keys");
const {
  campaignShareEmail,
  campaignCreateEmail,
  campaignEditEmail,
} = require("../../../utils/emails");

const getDateFromDateTime = (dateStr) => {
  return new Date(new Date(dateStr).toISOString().split("T")[0]);
};

const { joi_id } = require("../util/check");

const campaignCreateSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  client: joi_id,
  cities: Joi.array().min(1).items(joi_id),
  budget: Joi.number().positive().required(),
  priority: Joi.boolean().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  places: Joi.array()
    .min(1)
    .items(
      Joi.object({
        place: joi_id,
        count: Joi.number().integer().required(),
      })
    ),
  user: joi_id,
});

const campaignEditSchema = Joi.object({
  _id: joi_id,
  name: Joi.string().min(3).max(30).required(),
  client: joi_id,
  cities: Joi.array().min(1).items(joi_id),
  budget: Joi.number().positive().required(),
  priority: Joi.boolean().required(),
  startDate: Joi.number().integer().required(),
  endDate: Joi.number().integer().required(),
  places: Joi.array()
    .min(1)
    .items(
      Joi.object({
        place: joi_id,
        count: Joi.number().integer().required(),
      })
    ),
  user: joi_id,
});

const campaignShareSchema = Joi.object({
  _id: joi_id,
  email: Joi.string().email().required(),
  user: joi_id,
});

const campaignSearchSchema = Joi.object({
  search: Joi.string().allow(""),
  skip: Joi.number().integer(),
  user: joi_id,
});

module.exports = {
  campaign: async (args, req) => {
    AuthCheck(req);
    const { _id } = args;
    if (_id && !shortId.isValid(_id)) return null;
    return campaign_dyn(_id, req);
  },
  campaigns: async (args, req) => {
    AuthCheck(req);
    // const {skip, limit, search} = args;
    return campaigns_dyn({}, req);
  },
  campaignsActive: async (_, req) => {
    AuthCheck(req);
    return (await Campaign.getAllActiveAsync()).map((camp) =>
      campaignObject_dyn(camp, req)
    );
  },
  campaignsTil: async (args, req) => {
    PermissionCheck(req, [3, 5]);
    return (
      await new Promise((resolve, reject) => {
        sql.query(
          `SELECT * from Campaign WHERE created_at>= ?`,
          [new Date(parseInt(args.date))],
          function (err, res) {
            if (err) return reject(err);
            return resolve(res);
          }
        );
      })
    ).map((camp) => campaignObject_dyn(camp, req));
  },
  campaignsForInstallers: async (args, req) => {
    AuthCheck(req);

    const data = SchemaValidator(campaignSearchSchema, {
      ...args,
      user: req.userId,
    });
    let skipQ = data.skip ? data.skip : 0;

    const installer = await SQLRowAsync(
      "Installer",
      { user_id: data.user, isActive: 1 },
      "team_id"
    );

    const campaigns = await new Promise((resolve, reject) => {
      // ${skipLimit({skipQ, limit:8})}
      sql.query(
        `SELECT * FROM Campaign WHERE endDate>= ? AND ${
          data.search ? `name REGEXP ${sql.escape(data.search)} AND` : ""
        } _id IN (select campaign_id FROM InstallOrder where team_id = ?)`,
        [new Date(new Date().getTime() - 604800000), installer.team_id],
        (err, data) => {
          if (err) reject(err);
          else resolve(data);
        }
      );
    });
    return campaigns.map((c) => {
      return { ...campaignForInstallersObject_dyn(c, installer.team_id) };
    });
  },
  campaignVehicles: async (args, req) => {
    AuthCheck(req);
    const { _id } = args;
    if (!shortId.isValid(_id)) return null;
    return (await installs_dyn({ campaign_id: _id }, req)).map((inst) =>
      inst.vehicle()
    );
  },
  campaignPictures: async (args, req) => {
    AuthCheck(req);
    const { _id } = args;
    if (!shortId.isValid(_id)) return null;
    return pictures_dyn({ campaign_id: _id }, req);
  },
  campaignVehiclesForInstallers: async (args, req) => {
    AuthCheck(req);
    const { _id, search, skip } = args;
    if (!shortId.isValid(_id)) return null;

    return (
      await new Promise((resolve, reject) => {
        sql.query(
          `SELECT * FROM Vehicle WHERE _id IN (SELECT vehicle_id FROM Install WHERE installed=1 AND campaign_id = ? AND vehicle_id REGEXP ${
            !!search ? sql.escape(search) : `'.'`
          });`,
          [_id],
          (err, data) => {
            if (err) reject(err);
            else resolve(data);
          }
        );
      })
    ).map((camp) => vehicleObject_dyn(camp, req));
  },
  campaignLogin: async (args) => {
    const { _id, password } = args;
    if (!shortId.isValid(_id) || !password) return null;
    try {
      const campaign = await Campaign.getByIdAsync(_id, "password");
      if (!campaign) return null;
      if (!campaign.password) return null;
      if (!(await bcrypt.compare(password, campaign.password))) return null;

      return jwt.sign({ userRole: 7 }, JWTSecret, { expiresIn: "1d" });
    } catch (err) {
      console.log("error:", err.toString());
      return null;
    }
  },
  campaignShare: async (args, req) => {
    PermissionCheck(req, [3, 5]);
    try {
      const data = SchemaValidator(campaignShareSchema, {
        ...args,
        user: req.userId,
      });
      if (!shortId.isValid(data._id)) return null;

      const campaign = await Campaign.getByIdAsync(data._id, "_id, name");
      if (!campaign) return false;
      const pass = genPass.generate({ length: 12, numbers: true });
      campaign.password = await bcrypt.hash(pass, 12);
      await Campaign.updateAsync(campaign._id, campaign);

      Activity.create(
        new Activity({
          user1_id: data.user,
          campaign_id: campaign._id,
          string1: data.email,
          activityType: ActivityTypes.CAMPAIGN.SHARE,
        }),
        (err) => (err ? console.log(err) : "")
      );

      return !!(await campaignShareEmail(campaign, pass, data.email));
    } catch (err) {
      console.log("error:", err.toString());
      return false;
    }
  },

  campaignCreate: async (args, req) => {
    PermissionCheck(req, [3, 5]);
    console.log(args);
    try {
      const data = SchemaValidator(campaignCreateSchema, {
        ...args,
        user: req.userId,
      });

      let start_date = getDateFromDateTime(data.startDate);
      let end_date = getDateFromDateTime(data.endDate);

      if (start_date > end_date) {
        const temp = start_date;
        start_date = end_date;
        end_date = temp;
      }
      if (new Date() > start_date) return null;

      const clientDoc = await SQLRowAsync(
        "Client",
        { _id: data.client },
        "_id"
      );
      if (!clientDoc) return null;
      const userDoc = await SQLRowAsync("User", { _id: data.user }, "_id");
      if (!userDoc) return null;

      await Promise.all(
        data.places.map((place) => {
          return new Promise((resolve) => {
            Place.getById(
              place.place,
              (err, data) => {
                if (err) throw new Error(err);
                if (data) resolve(data[0]);
                else throw new Error("Place was not found!");
              },
              "_id"
            );
          });
        })
      );
      await Promise.all(
        data.cities.map((city) => {
          return new Promise((resolve) => {
            City.getById(
              city,
              (err, data) => {
                if (err) throw new Error(err);
                if (data) resolve(data[0]);
                else throw new Error("City was not found!");
              },
              "_id"
            );
          });
        })
      );

      const object = new Campaign({
        name: data.name,
        client_id: clientDoc._id,
        creator_id: userDoc._id,
        budget: data.budget,
        priority: data.priority,
        startDate: start_date,
        endDate: end_date,
      });
      await Campaign.createAsync(object);

      data.places.forEach((place) => {
        Placement.create(
          new Placement({
            count: place.count,
            place_id: place.place,
            campaign_id: object._id,
          }),
          (err) => (err ? console.log(err) : undefined)
        );
      });

      data.cities.forEach((city) => {
        CampaignCity.create(
          new CampaignCity({
            campaign_id: object._id,
            city_id: city,
          }),
          (err) => (err ? console.log(err) : undefined)
        );
      });

      Activity.create(
        new Activity({
          user1_id: userDoc._id,
          campaign_id: object._id,
          activityType: ActivityTypes.CAMPAIGN.NEW,
        }),
        (err) => (err ? console.log(err) : undefined)
      );

      // SEND EMAIL /////////////////////////////////////////////////////////////////

      if (!(await campaignCreateEmail()))
        console.log("Campaign Create Email was not sent");
      return { ...object };
    } catch (err) {
      console.log(err);
      return null;
    }
  },
  campaignUpdate: async (args, req) => {
    PermissionCheck(req, [3, 5]);
    try {
      const data = SchemaValidator(campaignEditSchema, {
        ...args,
        user: req.userId,
      });

      const start_date = getDateFromDateTime(data.startDate);
      const end_date = getDateFromDateTime(data.endDate);

      const object = await Campaign.getByIdAsync(data._id);
      if (!object) return null;

      if (data.places.length > 0 && object.startDate > Date.now()) {
        const existingPlacements = await SQLTableAsync(
          "Placement",
          { campaign_id: object._id },
          "_id, count, place_id"
        );
        const newPlaces = [];
        let count = 0;

        data.places.forEach((placeObj) => {
          // check if its in? or updated?
          const found = existingPlacements.find(
            (pl) => pl.place_id === placeObj.place
          );

          if (found) {
            if (placeObj.count !== found.count) {
              // update field
              Placement.update(found._id, { count: placeObj.count }, (err) => {
                if (err) console.log(err);
              });
            }
            count++;
          } else {
            //new field
            newPlaces.push(placeObj);
          }
        });

        if (count < existingPlacements.length) {
          // There is removed fields
          existingPlacements.forEach((placement) => {
            const found = data.places.find(
              (placeobj) => placeobj.place === placement.place_id
            );
            if (!found) {
              Placement.remove(placement._id, (done) => {
                if (!done) console.log("Error: Campaign Placement nor removed");
              });
            }
          });
        }
        //Check new value and create placements
        Promise.all(
          newPlaces.map((place) => {
            return new Promise((resolve) => {
              Place.getById(
                place.place,
                (err, data) => {
                  if (err) throw new Error(err);
                  if (data) resolve(data[0]);
                  else throw new Error("Place was not found!");
                },
                "_id"
              );
            });
          })
        )
          .then(() => {
            newPlaces.forEach((place) => {
              Placement.create(
                new Placement({
                  count: place.count,
                  place_id: place.place,
                  campaign_id: object._id,
                }),
                (err) => {
                  if (err) console.log(err);
                }
              );
            });
          })
          .catch((err) => {
            console.log(err);
          });
      } // PLACEMENTS UPDATE ///////////////////

      if (data.cities.length > 0) {
        const existingCities = await SQLTableAsync(
          "CampaignCity",
          { campaign_id: object._id },
          "city_id"
        );
        let countCities = 0;
        data.cities.forEach((city) => {
          if (existingCities.find((exCity) => exCity.city_id === city)) {
            countCities++;
          } else {
            CampaignCity.create(
              new CampaignCity({
                campaign_id: object._id,
                city_id: city,
              }),
              (err) => {
                if (err) console.log(err);
              }
            );
          }
        });
        if (countCities < existingCities.length) {
          existingCities.forEach((city) => {
            const found = data.cities.find(
              (newCity) => newCity === city.city_id
            );
            if (!found) {
              CampaignCity.remove(city.city_id, object._id, (err) =>
                err ? console.log(err) : undefined
              );
            }
          });
        }
      }
      if (data.client !== object.client) {
        const client = await SQLRowAsync("Client", { _id: data.client }, "_id");
        if (client) {
          Activity.create(
            new Activity({
              user1_id: data.user,
              campaign_id: object._id,
              string1: object.client,
              string2: data.client,
              activityType: ActivityTypes.CAMPAIGN.EDIT.CLIENT,
            }),
            (err) => (err ? console.log(err) : "")
          );

          object.client_id = data.client;
        }
      }

      if (data.name !== object.name) {
        Activity.create(
          new Activity({
            user1_id: data.user,
            campaign_id: object._id,
            string1: object.name,
            string2: data.name,
            activityType: ActivityTypes.CAMPAIGN.EDIT.NAME,
          }),
          (err) => (err ? console.log(err) : "")
        );

        object.name = data.name;
      }
      if (data.budget !== object.budget) {
        Activity.create(
          new Activity({
            user1_id: data.user,
            campaign_id: object._id,
            string1: object.budget.toString(),
            string2: data.budget.toString(),
            activityType: ActivityTypes.CAMPAIGN.EDIT.BUDGET,
          }),
          (err) => (err ? console.log(err) : "")
        );

        object.budget = data.budget;
      }
      if (data.priority !== object.priority) {
        Activity.create(
          new Activity({
            user1_id: data.user,
            campaign_id: object._id,
            string1: object.priority.toString(),
            string2: data.priority.toString(),
            activityType: ActivityTypes.CAMPAIGN.EDIT.PRIORITY,
          }),
          (err) => (err ? console.log(err) : "")
        );

        object.priority = data.priority;
      }

      if (start_date.getTime() !== object.startDate.getTime()) {
        Activity.create(
          new Activity({
            user1_id: data.user,
            campaign_id: object._id,
            string1: object.startDate.getTime().toString(),
            string2: start_date.getTime().toString(),
            activityType: ActivityTypes.CAMPAIGN.EDIT.START_DATE,
          }),
          (err) => (err ? console.log(err) : "")
        );

        object.startDate = start_date;
      }

      if (end_date.getTime() !== object.endDate.getTime()) {
        Activity.create(
          new Activity({
            user1_id: data.user,
            campaign_id: object._id,
            string1: object.endDate.getTime().toString(),
            string2: end_date.getTime().toString(),
            activityType: ActivityTypes.CAMPAIGN.EDIT.END_DATE,
          }),
          (err) => (err ? console.log(err) : "")
        );

        object.endDate = end_date;
      }
      await Campaign.updateAsync(object._id, object);
      campaignEditEmail(object);

      object.cities = data.cities;
      return { ...object };
    } catch (err) {
      console.log(err);
      return null;
    }
  },
  campaignHardDelete: async (args, req) => {
    PermissionCheck(req, [5, 11]);
    const { _id } = args;
    try {
      return await Campaign.deleteOneAsync(_id);
    } catch (err) {
      console.log(err);
      return false;
    }
  },
};
