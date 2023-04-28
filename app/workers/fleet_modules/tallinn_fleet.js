const { fetchInterval } = require('../../config/fleet');
const { updateFleet } = require('./utils');
const fetch = require('node-fetch');

function reworkCords(input) {
  return parseFloat(input) / 1000000;
}

module.exports = (city) => {
  updateTLLFleet = async (x) => {
    const vehicle = x.split(',');

    const lng = reworkCords(vehicle[2]);
    const lat = reworkCords(vehicle[3]);

    if (lat && lng) {
      const type = parseInt(vehicle[0]);
      const line = vehicle[1];
      const vehicleNumber = vehicle[6];
      updateFleet(
        vehicleNumber.padStart(5, '0'),
        '0000',
        city,
        type,
        line,
        lat,
        lng
      );
    }
  };

  fetch_tallinn = async () => {
    try {
      const res = await fetch(
        'https://transport.tallinn.ee/readfile.php?name=gps.txt'
      );
      const vehicles = (await res.text()).split('\n');

      for (const x of vehicles) {
        if (!x) continue;
        updateTLLFleet(x);
      }
    } catch (err) {
      console.log(`${city.name} : ` + err.toString());
    }
  };

  fetch_tallinn();
  setInterval(fetch_tallinn, fetchInterval);
};
