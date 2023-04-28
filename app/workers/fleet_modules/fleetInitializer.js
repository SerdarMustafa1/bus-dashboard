const tallinn = require('./tallinn_fleet');
const helsinki = require('./helsinki_fleet');

const City = require('../../models/mysql/city');
const Vehicle = require('../../models/mysql/vehicle');

const sql = require('../../db');

const { SQLRowAsync } = require('../../models/queryTools');

const context = require('./context');
const schedule = require('node-schedule');

const cities = [
  {
    name: 'Tallinn',
    short: 'TLL',
    latitude: 59.437,
    longitude: 24.7536,
    module: tallinn,
  },
  {
    name: 'Helsinki',
    short: 'HSL',
    latitude: 60.1699,
    longitude: 24.9384,
    module: helsinki,
  },
];

const defaultOptions = {
  saveScheduled: true,
};

class FleetLoader {
  constructor() {
    console.log('Loading operators...');
    sql.query(
      'SELECT o._id, o.operatorId, o.listed, o.visible, c.short FROM City c INNER JOIN Operator o ON c._id = o.city_id',
      null,
      (err, data) => {
        if (err) throw err;
        data.forEach(
          (operator) =>
            (context.operators[operator.short + operator.operatorId] = operator)
        );
        console.log(`All operators loaded.(${data.length})`);
      }
    );
    sql.query('DELETE FROM Vehicle WHERE line = "0"', [], (err) =>
      err ? console.log(err) : undefined
    );

    console.log('Loading vehicles...');
    sql.query(
      'SELECT _id, latitude, longitude, line FROM Vehicle;',
      [],
      (err, data) => {
        if (err) throw err;
        data.forEach((vehicle) => {
          context.fleets[vehicle._id] = {
            latitude: vehicle.latitude || 0.0,
            longitude: vehicle.longitude || 0.0,
            line: vehicle.line,
          };
        });
        console.log(`All vehicles loaded.(${data.length})`);
      }
    );
  }

  run(options = defaultOptions, cb = () => {}) {
    options = { ...defaultOptions, ...options };

    cities.forEach((city) => {
      const { name, short, latitude, longitude, module } = city;
      SQLRowAsync('City', { name, short })
        .then((data) => {
          if (!data) {
            console.log(`Creating and starting new city: ${name}`);
            City.create(
              new City({ name, short, latitude, longitude }),
              (err, newCity) => {
                if (err) return console.log(err);
                module(newCity);
              }
            );
          } else {
            console.log(`Loading and starting existing city: ${name}`);
            module(data);
          }
        })
        .catch((err) => {
          console.log('City failed', err);
        });
    });

    if (options.saveScheduled) {
      schedule.scheduleJob('0 0 0 * * *', () => {
        this.saveToCloud();
      });
    }
    cb();
  }

  saveToCloud() {
    console.log('Fleet: Updating database GEO');
    Promise.all(
      Object.keys(context.fleets).map((fleetId) => {
        const { latitude, longitude, line } = context.fleets[fleetId];
        return Vehicle.updateAsync(fleetId, {
          latitude,
          longitude,
          line,
        }).catch((err) => {
          if (err)
            console.log(
              `Error while updating ${fleetId} GEO: ${err.toString()}`
            );
        });
      })
    )
      .then(() => console.log('DB: Vehicles update complete!'))
      .catch((err) =>
        console.log(`Error: Scheduled fleet GEO update: ${err.toString()}`)
      );
  }
}

const fl = new FleetLoader();

context.fleetloader = fl;

module.exports = fl;
