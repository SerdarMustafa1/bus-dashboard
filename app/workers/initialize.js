const Place = require('../models/mysql/place');
const sql = require('../db');

const places = [
  'Maxiparaati',
  'Paraati',
  'Kokoperä',
  'Takamainos',
  'Ulkosivu',
  'Pysäkkisivu',
  'Erikoisteipattu',
  'Kokoteipattu',
  'Istuinselusta',
  'Kuljettajanselusta',
];

async function updateListedVehicles() {
  sql.query(
    `UPDATE Vehicle v, Operator o SET v.listed = o.listed, v.visible = o.visible WHERE v.operator_id = o._id;`,
    [],
    (err) => (err ? console.log(err) : '')
  );
}
async function updateActivityInstalls() {
  sql.query(
    `UPDATE Activity as a SET 
    placement_id = (SELECT placement_id FROM Install WHERE id = a.install_id LIMIT 1), 
    campaign_id = (SELECT campaign_id FROM Install WHERE id = a.install_id LIMIT 1) 
    WHERE activityType = "install.new";`,
    [],
    (err) => (err ? console.log(err) : '')
  );
}
async function updateActivityRemoves() {
  sql.query(
    `UPDATE Activity as a SET 
    placement_id = (SELECT placement_id FROM Remove WHERE id = a.remove_id LIMIT 1), 
    campaign_id = (SELECT campaign_id FROM Remove WHERE id = a.remove_id LIMIT 1) 
    WHERE activityType = "remove.new";`,
    [],
    (err) => (err ? console.log(err) : '')
  );
}
async function clientsTotalBudget() {
  sql.query(
    'UPDATE Client c SET c.totalBudget = coalesce((SELECT sum(budget) from Campaign u where u.client_id = c._id),0)',
    [],
    (err) => (err ? console.log(err) : '')
  );
}
async function vehicleCountAds() {
  sql.query(
    `UPDATE Vehicle v SET 
    v.totalAds = coalesce((SELECT SUM(count) FROM Install i WHERE i.vehicle_id= v._id AND i.installed=1),0), 
    v.haveAds = v.totalAds>0`,
    [],
    (err) => (err ? console.log(err) : '')
  );
}

async function makeAllPlaces() {
  for (const place of places)
    sql.query(
      'INSERT IGNORE INTO Place SET ?',
      [new Place({ name: place })],
      (err) => (err ? console.log(err) : '')
    );
}

module.exports = () => {
  const fleetRunner = require('./fleet_modules/fleetInitializer');
  fleetRunner.run({ saveScheduled: false });
  // require("./campaignRunner")();

  // const User = require('../models/mysql/user');
  // User.createUser(new User({ email:"admin@laulavaovipumppu.fi", name:"Admin", role:5, password: 'test1234' }));
  // User.createUser(new User({ email:"sale@laulavaovipumppu.fi", name:"Sale", role:3, password: 'test1234' }));
  // User.createUser(new User({ email:"lead@laulavaovipumppu.fi", name:"Lead", role:1, password: 'test1234' }));
  // User.createUser(new User({ email:"installer@laulavaovipumppu.fi", name:"Installer", role:0, password: 'test1234' }));

  updateListedVehicles();
  makeAllPlaces();
  updateActivityInstalls();
  updateActivityRemoves();
  clientsTotalBudget();
  vehicleCountAds();
};
