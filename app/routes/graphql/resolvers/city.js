const cities_dyn = require('../dynamic').cities;
const city_dyn = require('../dynamic').city;
const vehicles_dyn = require('../dynamic').vehicles;
const vehicleObject_dyn = require('../dynamic').vehicleObject;

const { PermissionCheck, AuthCheck } = require('../util/error');
const sql = require('../../../db');

module.exports = {
  city: async (args, req) => {
    PermissionCheck(req, [3, 5, 11]);
    const { _id } = args;
    return city_dyn(_id, req);
  },
  cities: async (_, req) => {
    PermissionCheck(req, [1, 3, 5, 11]);
    return cities_dyn({}, req);
  },
  cityVehicles: async (args, req) => {
    AuthCheck(req);
    const { _id } = args;
    const query = { city_id: _id };
    if ([5, 11].includes(req.userRole)) {
      const results = await new Promise((resolve) => {
        sql.query(
          `SELECT _id, haveAds, numberPlate, city_id, operator_id, listed, totalAds FROM Vehicle 
        WHERE city_id = ? AND (listed = 1 OR visible = 1)`,
          [_id],
          (err, data) => resolve(err ? [] : data)
        );
      });
      return results.map((result) => vehicleObject_dyn(result, req));
    }
    return vehicles_dyn(query, req);
  },
};
