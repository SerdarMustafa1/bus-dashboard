const config = require('../../../config/site');
const fleetContext = require('../../../workers/fleet_modules/context');

const { PermissionCheck } = require('../util/error');

fleetloaderTimeout = null;

module.exports = {
  saveVehiclesLocations: async (_, req) => {
    PermissionCheck(req, [5]);

    if (!fleetloaderTimeout) {
      fleetloaderTimeout = setTimeout(() => {
        fleetloaderTimeout = null;
      }, 30000);
      fleetContext.fleetloader.saveToCloud();
      return true;
    }
    return false;
  },
  protectEndPointsSet: async (args, req) => {
    PermissionCheck(req, [5]);
    const { value } = args;
    config.production = value;
    return true;
  },
};
