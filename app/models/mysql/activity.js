const sql = require('../../db.js');
const { filter: queryFilter, skipLimit } = require('../queryTools');
const ActivityTypes = require('../activityTypes');
const { SQLRowAsync } = require('../queryTools');

//Activity object constructor
const Activity = function (activity) {
  this.user1_id = activity.user1_id;
  this.user2_id = activity.user2_id;
  this.client_id = activity.client_id;
  this.campaign_id = activity.campaign_id;
  this.placement_id = activity.placement_id;
  this.install_id = activity.install_id;
  this.remove_id = activity.remove_id;
  this.operator_id = activity.operator_id;
  this.vehicle_id = activity.vehicle_id;
  this.team_id = activity.team_id;
  this.string1 = activity.string1;
  this.string2 = activity.string2;
  this.activityType = activity.activityType;
};

Activity.create = function (object, cb) {
  sql.query('INSERT INTO Activity set ?', object, function (err) {
    if (err) {
      console.log('error: ', err);
      cb(err, null);
    } else {
      cb(null, object);
    }
  });
};
Activity.getById = function (id, result, select) {
  sql.query(
    `SELECT ${select ? select : '*'} FROM Activity WHERE _id = ? LIMIT 1`,
    id,
    function (err, res) {
      if (err) {
        console.log('error: ', err);
        return result(err, null);
      }
      if (res.length > 0) result(null, res[0]);
      else result(null, null);
    }
  );
};
Activity.getAll = function (result, options) {
  const select = options ? options.select : null;
  sql.query(
    `Select ${select ? select : '*'} from Activity ${skipLimit(options)}`,
    function (err, res) {
      if (err) {
        console.log('error: ', err);
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};
Activity.getAllAsync = async function (options) {
  const select = options ? options.select : null;
  return new Promise((resolve, reject) => {
    sql.query(
      `Select ${select ? select : '*'} from Activity ${skipLimit(options)}`,
      function (err, res) {
        if (err) {
          console.log('error: ', err);
          reject(err);
        } else {
          resolve(res);
        }
      }
    );
  });
};
Activity.query = (filter, cb, options) => {
  const select = options ? options.select : null;
  sql.query(
    `SELECT ${select ? select : '*'} FROM Activity ${queryFilter(
      filter
    )} ${skipLimit(options)}`,
    null,
    (err, data) => {
      if (err) cb(err, null);
      cb(null, data);
    }
  );
};
Activity.queryAsync = async (filter, options) => {
  const select = options ? options.select : null;
  return await new Promise((resolve, reject) => {
    sql.query(
      `SELECT ${select ? select : '*'} FROM Activity ${queryFilter(
        filter
      )} ${skipLimit(options)}`,
      null,
      (err, data) => {
        if (err) return reject(err);
        return resolve(data);
      }
    );
  });
};
Activity.update = (id, object, cb) => {
  delete object._id;
  sql.query(
    `UPDATE Activity SET ? WHERE _id = ?`,
    [object, id],
    (err, data) => {
      if (err) return cb(err, null);
      object._id = id;
      cb(null, object);
    }
  );
};
Activity.updateAsync = (id, object) => {
  delete object._id;
  return new Promise((resolve, reject) => {
    sql.query(
      `UPDATE Activity SET ? WHERE _id = ?`,
      [object, id],
      (err, data) => {
        if (err) reject(err);
        object._id = id;
        resolve(object);
      }
    );
  });
};
Activity.deleteOneAsync = async function (id) {
  return await new Promise((resolve, reject) => {
    sql.query(`DELETE FROM Activity WHERE id = ?`, [id], (err) =>
      err ? reject(err) : resolve(true)
    );
  });
};
Activity.deleteAllAsync = async function (objs) {
  try {
    for (const obj of objs) await Activity.deleteOneAsync(obj.id);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

const Links = {
  user: (user) => {
    if (user) return `<a href="/dashboard/user/${user._id}">${user.name}</a>`;
    return `<a href="#">Unk</a>`;
  },
  campaign: (campaign) => {
    if (campaign)
      return `<a href="/dashboard/campaign/${campaign._id}">${campaign.name}</a>`;
    return `<a href="#">Unk</a>`;
  },
  client: (client) => {
    if (client)
      return `<a href="/dashboard/client/${client._id}">${client.company}</a>`;
    return `<a href="#">Unk</a>`;
  },
  vehicle: (vehicle) => {
    if (vehicle)
      return `<a href="/dashboard/vehicle/${vehicle._id}">${vehicle._id}${
        vehicle.numberPlate ? ` ${vehicle.numberPlate}` : ''
      }</a>`;
    return `<a href="#">Unk</a>`;
  },
};

const fromToStr = (s1, s2) => (!s1 && !s2 ? '' : ` from ${s1} to ${s2}`);

Activity.message = async function (activity) {
  const type = activity.activityType;

  try {
    if (activity.user1_id) {
      activity.user1 = await SQLRowAsync(
        'User',
        { _id: activity.user1_id },
        'name'
      );
      activity.user1._id = activity.user1_id;
    }
    if (activity.user2_id) {
      activity.user2 = await SQLRowAsync(
        'User',
        { _id: activity.user2_id },
        'name'
      );
      activity.user2._id = activity.user2_id;
    }
    if (activity.client_id) {
      activity.client = await SQLRowAsync(
        'Client',
        { _id: activity.client_id },
        'company'
      );
      activity.client._id = activity.client_id;
    }
    if (activity.campaign_id) {
      activity.campaign = await SQLRowAsync(
        'Campaign',
        { _id: activity.campaign_id },
        'name, budget'
      );
      activity.campaign._id = activity.campaign_id;
    }
    // if (activity.placement_id) {
    //     activity.placement = await SQLRowAsync('Placement', {_id: activity.placement_id}, 'count');
    // }
    if (activity.operator_id) {
      activity.operator = await SQLRowAsync(
        'Operator',
        { _id: activity.operator_id },
        'company'
      );
      activity.operator._id = activity.operator_id;
    }
    if (activity.vehicle_id) {
      activity.vehicle = await SQLRowAsync(
        'Vehicle',
        { _id: activity.vehicle_id },
        'numberPlate'
      );
      activity.vehicle._id = activity.vehicle_id;
    }
  } catch (e) {
    console.log(e);
    return 'Error: 500';
  }

  try {
    if (!type) return 'Type is undefined';

    switch (type) {
      case ActivityTypes.CAMPAIGN.NEW:
        return `${Links.user(activity.user1)} created campaign ${Links.campaign(
          activity.campaign
        )} worth ${activity.campaign.budget}€.`;
      case ActivityTypes.CAMPAIGN.EDIT.NAME:
        return `${Links.user(activity.user1)} changed campaign ${Links.campaign(
          activity.campaign
        )} name${fromToStr(activity.string1, activity.string2)}.`;
      case ActivityTypes.CAMPAIGN.EDIT.CLIENT:
        return `${Links.user(activity.user1)} changed campaign ${Links.campaign(
          activity.campaign
        )} client${fromToStr(activity.string1, activity.string2)}.`;
      case ActivityTypes.CAMPAIGN.EDIT.BUDGET:
        return `${Links.user(activity.user1)} changed campaign ${Links.campaign(
          activity.campaign
        )} budget${fromToStr(activity.string1, activity.string2)}.`;
      case ActivityTypes.CAMPAIGN.EDIT.CITIES:
        return `${Links.user(activity.user1)} changed campaign ${Links.campaign(
          activity.campaign
        )} cities${fromToStr(activity.string1, activity.string2)}.`;
      case ActivityTypes.CAMPAIGN.EDIT.START_DATE:
        return `${Links.user(activity.user1)} changed campaign ${Links.campaign(
          activity.campaign
        )} start date${fromToStr(activity.string1, activity.string2)}.`;
      case ActivityTypes.CAMPAIGN.EDIT.END_DATE:
        return `${Links.user(activity.user1)} changed campaign ${Links.campaign(
          activity.campaign
        )} end date${fromToStr(activity.string1, activity.string2)}.`;
      case ActivityTypes.CAMPAIGN.NOTIFICATION.PRE_START:
        return `Campaign ${Links.campaign(
          activity.campaign
        )} starts in 72 hours.`;
      case ActivityTypes.CAMPAIGN.NOTIFICATION.START:
        return `Campaign ${Links.campaign(activity.campaign)} started.`;
      case ActivityTypes.CAMPAIGN.NOTIFICATION.PRE_END:
        return `Campaign ${Links.campaign(
          activity.campaign
        )} ends in 72 hours.`;
      case ActivityTypes.CAMPAIGN.NOTIFICATION.END:
        return `Campaign ${Links.campaign(activity.campaign)} ended.`;
      case ActivityTypes.CAMPAIGN.SHARE:
        return `${Links.user(activity.user1)} shared campaign ${Links.campaign(
          activity.campaign
        )}${activity.string1 ? ` to ${activity.string1}` : ''}`;
      case ActivityTypes.CAMPAIGN.DELETE:
        return `${Links.user(activity.user1)} removed campaign ${Links.campaign(
          activity.campaign
        )} worth ${activity.campaign.budget}.`;

      case ActivityTypes.CLIENT.NEW:
        return `${Links.user(activity.user1)} created client ${Links.client(
          activity.client
        )}.`;
      case ActivityTypes.CLIENT.EDIT.COMPANY:
        return `${Links.user(activity.user1)} changed client ${
          activity.string1
        } to ${activity.string2}.`;
      case ActivityTypes.CLIENT.EDIT.PERSON:
        return `${Links.user(activity.user1)} changed client ${Links.client(
          activity.client
        )} contact person${fromToStr(activity.string1, activity.string2)}.`;
      case ActivityTypes.CLIENT.EDIT.EMAIL:
        return `${Links.user(activity.user1)} changed client ${Links.client(
          activity.client
        )} contact email${fromToStr(activity.string1, activity.string2)}.`;
      case ActivityTypes.CLIENT.EDIT.PHONE:
        return `${Links.user(activity.user1)} changed client ${Links.client(
          activity.client
        )} contact phone${fromToStr(activity.string1, activity.string2)}.`;
      case ActivityTypes.CLIENT.DELETE:
        return `${Links.user(activity.user1)} removed client ${Links.client(
          activity.client
        )}.`;

      case ActivityTypes.INSTALL.NEW:
        return `${Links.user(activity.user1)} added campaign ${Links.campaign(
          activity.campaign
        )} to ${Links.vehicle(activity.vehicle)}.`;
      case ActivityTypes.INSTALL.EDIT.COUNT:
        return `${Links.user(activity.user1)} changed campaign ${Links.campaign(
          activity.campaign
        )} on ${Links.vehicle(activity.vehicle)} amount${fromToStr(
          activity.string1,
          activity.string2
        )}.`;
      case ActivityTypes.INSTALL.DELETE:
        return `${Links.user(
          activity.user1
        )} deleted install with campaign ${Links.campaign(
          activity.campaign
        )} on ${Links.vehicle(activity.vehicle)}`;

      case ActivityTypes.REMOVE.NEW:
        return `${Links.user(activity.user1)} removed campaign ${Links.campaign(
          activity.campaign
        )} on ${Links.vehicle(activity.vehicle)}.`;
      case ActivityTypes.REMOVE.EDIT.COUNT:
        return `${Links.user(
          activity.user1
        )} changed removed campaign ${Links.campaign(
          activity.campaign
        )} on ${Links.vehicle(activity.vehicle)} amount${fromToStr(
          activity.string1,
          activity.string2
        )}.`;
      case ActivityTypes.REMOVE.DELETE:
        return `${Links.user(
          activity.user1
        )} deleted remove win campaign ${Links.campaign(
          activity.campaign
        )} on ${Links.vehicle(activity.vehicle)}.`;

      case ActivityTypes.USER.NEW:
        return `${Links.user(activity.user1)} created new user ${Links.user(
          activity.user2
        )}.`;
      case ActivityTypes.USER.EDIT.NAME:
        return `${Links.user(activity.user1)} changed user ${Links.user(
          activity.user2
        )} name${fromToStr(activity.string1, activity.string2)}.`;
      case ActivityTypes.USER.EDIT.EMAIL:
        return `${Links.user(activity.user1)} changed user ${Links.user(
          activity.user2
        )} email${fromToStr(activity.string1, activity.string2)}.`;
      case ActivityTypes.USER.EDIT.PASSWORD:
        return `${Links.user(activity.user1)} changed password.`;
      case ActivityTypes.USER.EDIT.CITY:
        return `${Links.user(activity.user1)} changed user ${Links.user(
          activity.user2
        )} city${fromToStr(activity.string1, activity.string2)}.`;
      case ActivityTypes.USER.EDIT.PHONE:
        return `${Links.user(activity.user1)} changed user ${Links.user(
          activity.user2
        )} phone${fromToStr(activity.string1, activity.string2)}.`;
      case ActivityTypes.USER.EDIT.ROLE:
        return `${Links.user(activity.user1)} changed user ${Links.user(
          activity.user2
        )} role${fromToStr(activity.string1, activity.string2)}.`;

      case ActivityTypes.OPERATOR.EDIT.COMPANY:
        return `${Links.user(
          activity.user1
        )} changed operator company name${fromToStr(
          activity.string1,
          activity.string2
        )}.`;
      case ActivityTypes.OPERATOR.EDIT.LISTED:
        return `${Links.user(activity.user1)} changed operator ${
          activity.operator.company
        } status${fromToStr(activity.string1, activity.string2)}.`;
      // case ActivityTypes.USER.DELETE:
      //     break;

      case ActivityTypes.FLEET.EDIT.NUMBERPLATE:
        if (activity.string1)
          return `${Links.user(activity.user1)} changed vehicle ${Links.vehicle(
            activity.vehicle_id
          )} number plate${fromToStr(activity.string1, activity.string2)}.`;
        return `${Links.user(activity.user1)} set vehicle ${Links.vehicle(
          activity.vehicle_id
        )} number plate to ${activity.string2}.`;

      default:
        return `Type '${activity.activityType}' is not listed`;
    }
  } catch (err) {
    console.log(activity);
    console.log(err);
    return 'Value error in database.';
  }
};

module.exports = Activity;
