const actionsResolver = require('./resolvers/actions');
const activityResolver = require('./resolvers/activity');
const campaignResolver = require('./resolvers/campaign');
const cityResolver = require('./resolvers/city');
const clientResolver = require('./resolvers/client');
const installResolver = require('./resolvers/install');
const installerResolver = require('./resolvers/installer');
const installOrderResolver = require('./resolvers/installOrder');
const pictureResolver = require('./resolvers/picture');
const placeResolver = require('./resolvers/place');
const placementResolver = require('./resolvers/placement');
const operatorResolver = require('./resolvers/operator');
const removeResolver = require('./resolvers/remove');
const userResolver = require('./resolvers/user');
const teamResolver = require('./resolvers/team');
const vehicleResolver = require('./resolvers/vehicle');

module.exports = {
  ...actionsResolver,
  ...activityResolver,
  ...campaignResolver,
  ...cityResolver,
  ...clientResolver,
  ...installResolver,
  ...installerResolver,
  ...installOrderResolver,
  ...operatorResolver,
  ...pictureResolver,
  ...placeResolver,
  ...placementResolver,
  ...removeResolver,
  ...userResolver,
  ...teamResolver,
  ...vehicleResolver,
};
