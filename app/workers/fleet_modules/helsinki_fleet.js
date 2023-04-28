const mqtt = require('mqtt');
const { updateFleet } = require('./utils');

const typeMapping = { trolleybus: 1, bus: 2, tram: 3 };

// 12: 'Helsingin Bussiliikenne Oy',
// 22: 'Nobina Finland Oy',
// 30: 'Savonlinja Oy',

module.exports = (city) => {
  const url = 'mqtts://mqtt.hsl.fi';
  let client = mqtt.connect(url);

  client.on('connect', function () {
    // client.subscribe(`/hfp/v2/journey/+/vp/bus/${'12'.padStart(4,'0')}/#`);
    // client.subscribe(`/hfp/v2/journey/+/vp/bus/${'22'.padStart(4,'0')}/#`);
    // client.subscribe(`/hfp/v2/journey/+/vp/bus/${'30'.padStart(4,'0')}/#`);
    client.subscribe(`/hfp/v2/journey/+/vp/bus/#`);
    // client.subscribe("/hfp/v2/journey/+/vp/tram/#");
  });

  client.on('error', (err) => {
    console.log('Helsinki fleet load Error');
  });

  client.on('message', function (topic, message) {
    const messageData = JSON.parse(message).VP;
    const topicData = topic.split('/');

    const type = topicData[6];
    const operator = topicData[7];
    const vehicleNumber = topicData[8];

    if (operator.length !== 4) {
      console.log('Not correct operator length');
      return;
    }
    if (vehicleNumber.length !== 5) {
      console.log('Not correct VehicleNumber length');
      return;
    }
    updateFleet(
      vehicleNumber,
      operator,
      city,
      typeMapping[type],
      messageData.desi,
      messageData.lat,
      messageData.long
    );
  });
};
// /hfp/v2/journey/ongoing/vp/bus/0055/01216/1069/1/Malmi/7:20/1130106/2/60;24/19/73/44
// /<prefix>/<version>/<journey_type>/<temporal_type>/<event_type>/<transport_mode>/<operator_id>/<vehicle_number>/<route_id>/<direction_id>/<headsign>/<start_time>/<next_stop>/<geohash_level>/<geohash>/#
