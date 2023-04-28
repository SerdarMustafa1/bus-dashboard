const context = require('../../workers/fleet_modules/context');

const sql = require('../../db');

const {
  SQLTableAsync,
  SQLRowAsync,
  filter,
} = require('../../models/queryTools');
const ActivityTypes = require('../../models/activityTypes');

const activities = async (src, req) => {
  try {
    const results = await SQLTableAsync('Activity', { ...src });
    return results.map((result) => activityObject(result, req));
  } catch (err) {
    console.log(err);
    return null;
  }
};
const campaigns = async (src, req) => {
  // const skipQ = skip || 0;
  // const limitQ = limit || 0;
  try {
    const results = await SQLTableAsync('Campaign', { ...src });
    return results.map((result) => campaignObject(result, req));
  } catch (err) {
    console.log(err);
    return null;
  }
};
const cities = async (src, req) => {
  try {
    const results = await SQLTableAsync('City', { ...src });
    return results.map((result) => cityObject(result, req));
  } catch (err) {
    console.log(err);
    return null;
  }
};
const clients = async (src, req) => {
  try {
    const results = await SQLTableAsync('Client', { ...src, isDeleted: 0 });
    return results.map((result) => clientObject(result, req));
  } catch (err) {
    console.log(err);
    return null;
  }
};
const pictures = async (src, req) => {
  try {
    const results = await SQLTableAsync('Picture', { ...src });
    return results.map((result) => pictureObject(result, req));
  } catch (err) {
    console.log(err);
    return null;
  }
};
const vehicles = async (src, req) => {
  if (!('listed' in src)) src.listed = 1;
  else if (src.listed === undefined) delete src['listed'];
  try {
    // Todo: add limit system
    const results = await SQLTableAsync(
      'Vehicle',
      { ...src },
      '_id, haveAds, numberPlate, city_id, operator_id, listed, totalAds'
    );
    return results.map((result) => vehicleObject(result, req));
  } catch (err) {
    console.log('Dynamic Vehicles', err);
    return null;
  }
};
const installs = async (src, req) => {
  try {
    const results = await SQLTableAsync('Install', { ...src });
    return results.map((result) => installObject(result, req));
  } catch (err) {
    console.log(err);
    return null;
  }
};
const installers = async (src, req) => {
  try {
    const results = await SQLTableAsync('Installer', { ...src });
    return results.map((result) => installerObject(result, req));
  } catch (err) {
    console.log(err);
    return null;
  }
};
const installOrders = async (src, req) => {
  try {
    const results = await SQLTableAsync('InstallOrder', { ...src });
    return results.map((result) => installOrderObject(result, req));
  } catch (err) {
    console.log(err);
    return null;
  }
};
const places = async (src, req) => {
  try {
    const results = await SQLTableAsync('Place', { ...src });
    return results.map((result) => placeObject(result, req));
  } catch (err) {
    console.log(err);
    return null;
  }
};
const placements = async (src, req) => {
  try {
    const results = await SQLTableAsync('Placement', { ...src });
    return results.map((result) => placementObject(result, req));
  } catch (err) {
    console.log(err);
    return null;
  }
};
const placementsForInstaller = async (src, req) => {
  const { _id, team_id } = src;
  if (!_id || !team_id) return null;
  try {
    const results = await new Promise((resolve, reject) => {
      sql.query(
        `SELECT * FROM Placement p 
      LEFT JOIN InstallOrder i on i.team_id = ? AND p._id = i.placement_id AND i.campaign_id = ? 
      WHERE i.placement_id=p._id`,
        [team_id, _id],
        (err, data) => {
          if (err) return reject(err);
          resolve(data);
        }
      );
    });
    return results.map((c) => placementInstallerObject(c));
  } catch (err) {
    console.log(err);
    return [];
  }
};
const operators = async (src, req) => {
  if (!('listed' in src)) src.listed = 1;
  else if (src.listed === undefined) delete src['listed'];
  try {
    const results = await SQLTableAsync('Operator', { ...src });
    return results.map((result) => operatorObject(result, req));
  } catch (err) {
    console.log(err);
    return null;
  }
};
const operatorsAdmin = async (src, req) => {
  try {
    const results = await new Promise((resolve) => {
      sql.query(
        `SELECT * FROM Operator ${filter(src)} AND (visible=1 OR listed=1)`,
        [],
        (err, data) => resolve(err ? [] : data)
      );
    });
    return results.map((result) => operatorObject(result, req));
  } catch (err) {
    console.log(err);
    return null;
  }
};
const removes = async (src, req) => {
  try {
    const results = await SQLTableAsync('Remove', { ...src });
    return results.map((result) => removeObject(result, req));
  } catch (err) {
    console.log(err);
    return null;
  }
};
const teams = async (src, req) => {
  try {
    const results = await SQLTableAsync('Team', { ...src, isDeleted: 0 });
    return results.map((result) => teamObject(result, req));
  } catch (err) {
    console.log(err);
    return null;
  }
};
const users = async (src, req) => {
  try {
    const results = await SQLTableAsync('User', { ...src, isDeleted: 0 });
    return results.map((result) => userObject(result, req));
  } catch (err) {
    console.log(err);
    return null;
  }
};

const campaignCities = async (id, req) => {
  try {
    return (
      await new Promise((resolve, reject) => {
        sql.query(
          `SELECT * FROM City WHERE _id IN (SELECT city_id FROM CampaignCity WHERE campaign_id = ${sql.escape(
            id
          )} )`,
          (err, data) => {
            if (err) reject(err);
            else resolve(data);
          }
        );
      })
    ).map((city) => cityObject(city, req));
  } catch (err) {
    console.log(err);
    return null;
  }
};
const cityCampaigns = async (id, req) => {
  try {
    return (
      await new Promise((resolve, reject) => {
        sql.query(
          `SELECT * FROM Campaign WHERE _id IN (SELECT campaign_id FROM CampaignCity WHERE city_id = ?);`,
          [id],
          (err, data) => {
            if (err) reject(err);
            else resolve(data);
          }
        );
      })
    ).map((camp) => campaignObject(camp, req));
  } catch (err) {
    console.log(err);
    return null;
  }
};

exports.activities = activities;
exports.campaigns = campaigns;
exports.campaignCities = campaignCities;
exports.cityCampaigns = cityCampaigns;
exports.cities = cities;
exports.clients = clients;
exports.vehicles = vehicles;
exports.installs = installs;
exports.installers = installers;
exports.installOrders = installOrders;
exports.places = places;
exports.placements = placements;
exports.placementsForInstallers = placementsForInstaller;
exports.pictures = pictures;
exports.operators = operators;
exports.removes = removes;
exports.teams = teams;
exports.users = users;

const activity = async (Id, req) => {
  try {
    let result;
    if (Id) result = await SQLRowAsync('Activity', { _id: Id });
    else result = await SQLRowAsync('Activity', {});
    if (!result) return null;

    return activityObject(result, req);
  } catch (err) {
    console.log(err);
    return null;
  }
};
const campaign = async (Id, req) => {
  try {
    let result;
    if (Id) result = await SQLRowAsync('Campaign', { _id: Id });
    else
      result = await new Promise((resolve, reject) => {
        sql.query(
          `SELECT * FROM Campaign ORDER BY created_at DESC LIMIT 1`,
          [],
          (err, data) => {
            if (err) return reject(err);
            if (data.length > 0) return resolve(data[0]);
            return resolve(null);
          }
        );
      });
    if (!result) return null;
    return campaignObject(result, req);
  } catch (err) {
    console.log(err);
    return null;
  }
};
const city = async (Id, req) => {
  try {
    let result;
    if (Id) result = await SQLRowAsync('City', { _id: Id });
    else result = await SQLRowAsync('City', {});
    if (!result) return null;

    return cityObject(result, req);
  } catch (err) {
    console.log(err);
    return null;
  }
};
const client = async (Id, req) => {
  try {
    let result;
    if (Id) result = await SQLRowAsync('Client', { _id: Id });
    else result = await SQLRowAsync('Client', {});
    if (!result) return null;

    return clientObject(result, req);
  } catch (err) {
    console.log(err);
    return null;
  }
};
const vehicle = async (Id, req) => {
  try {
    let result;
    if (Id)
      result = await SQLRowAsync(
        'Vehicle',
        { _id: Id },
        '_id, haveAds, numberPlate, city_id, operator_id, totalAds, listed'
      );
    else
      result = await SQLRowAsync(
        'Vehicle',
        {},
        '_id, haveAds, numberPlate, city_id, operator_id, totalAds, listed'
      );
    if (!result) return null;

    return vehicleObject(result, req);
  } catch (err) {
    console.log(err);
    return null;
  }
};
const install = async (Id, req) => {
  try {
    let result;
    if (Id) result = await SQLRowAsync('Install', { id: Id });
    else result = await SQLRowAsync('Install', {});
    if (!result) return null;

    return installObject(result, req);
  } catch (err) {
    console.log(err);
    return null;
  }
};
const installer = async (Id, req) => {
  try {
    let result;
    if (Id) result = await SQLRowAsync('Installer', { _id: Id });
    else result = await SQLRowAsync('Installer', {});
    if (!result) return null;

    return installObject(result, req);
  } catch (err) {
    console.log(err);
    return null;
  }
};
const installOrder = async (placement_id, team_id, req) => {
  try {
    let result;
    if (placement_id && team_id)
      result = await SQLRowAsync('InstallOrder', { placement_id, team_id });
    else result = await SQLRowAsync('InstallOrder', {});
    if (!result) return null;

    return installOrderObject(result, req);
  } catch (err) {
    console.log(err);
    return null;
  }
};
const picture = async (Id, req) => {
  try {
    let result;
    if (Id) result = await SQLRowAsync('Picture', { _id: Id });
    else result = await SQLRowAsync('Picture', {});
    if (!result) return null;

    return pictureObject(result, req);
  } catch (err) {
    console.log(err);
    return null;
  }
};
const place = async (Id, req) => {
  try {
    let result;
    if (Id) result = await SQLRowAsync('Place', { _id: Id });
    else result = await SQLRowAsync('Place', {});
    if (!result) return null;

    return placeObject(result, req);
  } catch (err) {
    console.log(err);
    return null;
  }
};
const placement = async (Id, req) => {
  try {
    let result;
    if (Id) result = await SQLRowAsync('Placement', { _id: Id });
    else result = await SQLRowAsync('Placement', {});
    if (!result) return null;

    return placementObject(result, req);
  } catch (err) {
    console.log(err);
    return null;
  }
};
const operator = async (Id, req) => {
  try {
    let result;
    if (Id) result = await SQLRowAsync('Operator', { _id: Id });
    else result = await SQLRowAsync('Operator', {});
    if (!result) return null;

    return operatorObject(result, req);
  } catch (err) {
    console.log(err);
    return null;
  }
};
const remove = async (Id, req) => {
  try {
    let result;
    if (Id) result = await SQLRowAsync('Remove', { id: Id });
    else result = await SQLRowAsync('Remove', {});
    if (!result) return null;

    return removeObject(result, req);
  } catch (err) {
    console.log(err);
    return null;
  }
};
const team = async (Id, req) => {
  try {
    let result;
    if (Id) result = await SQLRowAsync('Team', { _id: Id });
    else result = await SQLRowAsync('Team', {});
    if (!result) return null;
    return userObject(result, req);
  } catch (err) {
    console.log(err);
    return null;
  }
};
const user = async (Id, req) => {
  try {
    let result;
    if (Id) result = await SQLRowAsync('User', { _id: Id });
    else result = await SQLRowAsync('User', {});
    if (!result) return null;
    return userObject(result, req);
  } catch (err) {
    console.log(err);
    return null;
  }
};

exports.activity = activity;
exports.campaign = campaign;
exports.city = city;
exports.client = client;
exports.vehicle = vehicle;
exports.install = install;
exports.installer = installer;
exports.installOrder = installOrder;
exports.place = place;
exports.placement = placement;
exports.picture = picture;
exports.operator = operator;
exports.remove = remove;
exports.team = team;
exports.user = user;

const activityObject = (result, req) => {
  return {
    ...result,
  };
};
const campaignObject = (result, req) => {
  return {
    ...result,
    client: client.bind(this, result.client_id, req),
    creator: user.bind(this, result.creator_id, req),

    placements: placements.bind(this, { campaign_id: result._id }, req),
    pictures: pictures.bind(this, { campaign_id: result._id }, req),
    installs: installs.bind(this, { campaign_id: result._id }, req),
    installOrders: installs.bind(this, { campaign_id: result._id }, req),
    removes: removes.bind(this, { campaign_id: result._id }, req),
    cities: campaignCities.bind(this, result._id, req),
  };
};
const campaignForInstallerObject = (result, team_id, req) => {
  return {
    ...campaignObject(result, req),

    placements: placementsForInstaller.bind(
      this,
      { _id: result._id, team_id },
      req
    ),
    installs: [],
    installOrders: [],
  };
};
const cityObject = (result, req) => {
  return {
    ...result,

    vehicles: vehicles.bind(this, { city_id: result._id }, req),
    campaigns: cityCampaigns.bind(this, result._id, req),
    operators: [5, 11].includes(req.userRole)
      ? operatorsAdmin.bind(this, { city_id: result._id }, req)
      : operators.bind(this, { city_id: result._id }, req),
    operatorsAll: operators.bind(
      this,
      { city_id: result._id, listed: undefined },
      req
    ),
    users: users.bind(this, { city_id: result._id }, req),
  };
};
const clientObject = (result, req) => {
  return {
    ...result,

    campaigns: campaigns.bind(this, { client_id: result._id }, req),
  };
};

function vehType(id) {
  if (!id) return '';
  return parseInt(id.split('-').slice(-2)[0]);
}

const vehicleObject = (result, req) => {
  const { latitude, longitude, line } = context.fleets[result._id];
  if (result.haveAds === null) result.haveAds = 0;

  return {
    ...result,
    operator: operator.bind(this, result.operator_id, req),
    city: city.bind(this, result.city_id, req),
    type: vehType(result._id),

    installs: installs.bind(
      this,
      { vehicle_id: result._id, installed: 1 },
      req
    ),
    removes: removes.bind(this, { vehicle_id: result._id }, req),

    latitude,
    longitude,
    line,
  };
};
const installObject = (result, req) => {
  return {
    ...result,
    vehicle: vehicle.bind(this, result.vehicle_id, req),
    placement: placement.bind(this, result.placement_id, req),
    installer: user.bind(this, result.installer_id, req),
    campaign: campaign.bind(this, result.campaign_id, req),
    team: team.bind(this, result.team_id, req),
    remove: result.installed ? null : remove.bind(this, result.remove_id, req),
  };
};
const installerObject = (result, req) => {
  return {
    ...result,
    team: team.bind(this, result.team_id, req),
    user: user.bind(this, result.user_id, req),

    installs: installs.bind(this, { installer_id: result._id }, req),
  };
};
const installOrderObject = (result, req) => {
  return {
    ...result,
    campaign: campaign.bind(this, result.campaign_id, req),
    placement: placement.bind(this, result.placement_id, req),
    team: team.bind(this, result.team_id, req),
    creator: user.bind(this, result.user_id, req),

    installs: installs.bind(
      this,
      { placement_id: result.placement_id, team_id: result.team_id },
      req
    ),
    removes: removes.bind(
      this,
      { placement_id: result.placement_id, team_id: result.team_id },
      req
    ),
  };
};
const pictureObject = (result, req) => {
  return {
    ...result,
    user: campaign.bind(this, result.user_id, req),
    placement: campaign.bind(this, result.placement_id, req),
    vehicle: vehicle.bind(this, result.vehicle_id, req),
  };
};
const placeObject = (result, req) => {
  return {
    ...result,
    placements: placements.bind(this, { place_id: result._id }, req),
  };
};
const placementObject = (result, req) => {
  return {
    ...result,
    campaign: campaign.bind(this, result.campaign_id, req),
    place: place.bind(this, result.place_id, req),

    installs: installs.bind(this, { placement_id: result._id }, req),
    installOrders: installOrders.bind(this, { placement_id: result._id }, req),
    removes: removes.bind(this, { placement_id: result._id }, req),
  };
};
const operatorObject = (result, req) => {
  return {
    ...result,
    city: city.bind(this, result.city_id, req),

    vehicles:
      req.userRole && [5, 11].includes(req.userRole)
        ? vehicles.bind(
            this,
            { operator_id: result._id, listed: undefined },
            req
          )
        : vehicles.bind(this, { operator_id: result._id }, req),
  };
};
const removeObject = (result, req) => {
  return {
    ...result,
    campaign: campaign.bind(this, result.campaign_id, req),
    remover: user.bind(this, result.remover_id, req),
    placement: placement.bind(this, result.placement_id, req),
    vehicle: vehicle.bind(this, result.vehicle_id, req),
  };
};
const historyObject = (result, req) => {
  const hisObj = {
    ...result,
    vehicle: vehicle.bind(this, result.vehicle_id, req),
    user: user.bind(this, result.user1_id, req),

    campaign: campaign.bind(this, result.campaign_id, req),
    placement: placement.bind(this, result.placement_id, req),
  };
  if (result.activityType === ActivityTypes.INSTALL.NEW)
    hisObj.install = install.bind(this, result.install_id, req);
  else if (result.activityType === ActivityTypes.REMOVE.NEW)
    hisObj.remove = remove.bind(this, result.remove_id, req);
  return hisObj;
};
const teamObject = (result, req) => {
  return {
    ...result,
    installers: installers.bind(this, { installer_id: result._id }, req),
  };
};
const userObject = (result, req) => {
  return {
    ...result,
    password: null,
    passwordToken: null,
    PasswordTokenExpires: null,
    city: city.bind(this, result.city_id, req),

    installs: installs.bind(this, { installer_id: result._id }, req),
    removes: removes.bind(this, { remover_id: result._id }, req),
    campaigns: campaigns.bind(this, { creator_id: result._id }, req),
  };
};

const placementInstallerObject = (result, req) => {
  return {
    ...result,
    campaign: campaign.bind(this, result.campaign_id, req),
    place: place.bind(this, result.place_id, req),

    installs: installs.bind(
      this,
      { placement_id: result._id, team_id: result.team_id, installed: 1 },
      req
    ),
  };
};

exports.activityObject = activityObject;
exports.campaignObject = campaignObject;
exports.campaignForInstallersObject = campaignForInstallerObject;
exports.cityObject = cityObject;
exports.clientObject = clientObject;
exports.installObject = installObject;
exports.installerObject = installerObject;
exports.installOrderObject = installOrderObject;
exports.placeObject = placeObject;
exports.placementObject = placementObject;
exports.placementInstallerObject = placementInstallerObject;
exports.operatorObject = operatorObject;
exports.removeObject = removeObject;
exports.userObject = userObject;
exports.teamObject = teamObject;
exports.vehicleObject = vehicleObject;
exports.historyObject = historyObject;
