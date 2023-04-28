const context = require('./context');
const Vehicle = require('../../models/mysql/vehicle');
const Operator = require('../../models/mysql/operator');

const defined_operators = {
  6: 'Oy Pohjolan Liikenne Ab',
  12: 'Helsingin Bussiliikenne Oy',
  17: 'Tammelundin Liikenne Oy',
  18: 'Pohjolan Kaupunkiliikenne Oy',
  20: 'Bus Travel Åbergin Linja Oy',
  21: 'Bus Travel Oy Reissu Ruoti',
  22: 'Nobina Finland Oy',
  30: 'Savonlinja Oy',
  36: 'Nurmijärven Linja Oy',
  40: 'HKL-Raitioliikenne',
  45: 'Transdev Vantaa Oy',
  47: 'Taksikuljetus Oy',
  50: 'HKL-Metroliikenne',
  51: 'Korsisaari Oy',
  54: 'V-S Bussipalvelut Oy',
  55: 'Transdev Helsinki Oy',
  58: 'Koillisen Liikennepalvelut Oy',
  59: 'Tilausliikenne Nikkanen Oy',
  89: 'Metropolia',
  90: 'VR Oy',
};

function saveFleet(vehicle) {
  if (context.fleets[vehicle._id]) return;

  context.fleets[vehicle._id] = {
    latitude: vehicle.latitude || 0.0,
    longitude: vehicle.longitude || 0.0,
    line: vehicle.line,
  };
  Vehicle.create(vehicle, (err) => {
    if (err)
      console.log(
        `Error saving fleet | ${vehicle.city.name} | ${vehicle._id} |:`,
        err.toString()
      );
  });
}

module.exports = {
  measure: (lat1, lon1, lat2, lon2) => {
    // generally used geo measurement function
    let R = 6378.137; // Radius of earth in KM
    let dLat = (lat2 * Math.PI) / 180 - (lat1 * Math.PI) / 180;
    let dLon = (lon2 * Math.PI) / 180 - (lon1 * Math.PI) / 180;
    let a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c;
    return d * 1000; // meters
  },

  updateFleet: async (veh, operator, city, type, line, lat, lng) => {
    line = line.trim();
    veh = veh.trim();

    if (!lat || !lng || !veh || !line || line === '0' || !type) return;

    const fleetID = `${city.short}-${operator}-${type}-${veh}`;
    if (veh.length > 5) {
      console.log(
        'Vehicle Error!!! ',
        JSON.stringify({ id: fleetID, city, type, line, operator })
      );
      return;
    }

    if (context.operators[city.short + operator]) {
      if (!context.operators[city.short + operator]._id) return;

      if (context.fleets[fleetID]) {
        context.fleets[fleetID].line = line;
        context.fleets[fleetID].latitude = lat;
        context.fleets[fleetID].longitude = lng;
      } else {
        const { _id, listed, visible } = context.operators[
          city.short + operator
        ];
        saveFleet(
          new Vehicle({
            _id: fleetID,
            vehicleNumber: veh,
            operator_id: _id,
            type,
            city_id: city._id,
            line,
            latitude: lat,
            longitude: lng,
            listed,
            visible,
          })
        );
      }
    } else {
      const operatorNew = new Operator({
        operatorId: operator,
        city_id: city._id,
        company:
          parseInt(operator) in defined_operators
            ? defined_operators[parseInt(operator)]
            : undefined,
      });
      context.operators[city.short + operator] = {};
      console.log(`Creating new operator ${operator}`);
      Operator.create(operatorNew, (err, data) => {
        if (err) {
          console.log('Operator Creation failed!');
          delete context.operators[city.short + operator];
        } else {
          context.operators[city.short + operator] = data;
        }
      });
    }
  },
};
