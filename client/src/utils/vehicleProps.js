const trolley = require('../images/app/trolleybus.svg');
const bus = require('../images/app/bus.svg');
const tram = require('../images/app/tram.svg');

const types = {
  1: { name: 'trolleybus', img: trolley },
  2: { name: 'bus', img: bus },
  3: { name: 'tram', img: tram },
};

function vehID(id) {
  if (!id) return '';
  return id.split('-').slice(-1)[0];
}
function vehType(id) {
  if (!id) return '';
  return parseInt(id.split('-').slice(-2)[0]);
}
function vehTypeStr(id, t) {
  const type = vehType(id);
  return Object.keys(types).includes(type.toString())
    ? t('vehicle.type.' + types[type].name)
    : t('vehicle.type.unk');
}
function vehTypeObject(id) {
  return types[vehType(id)];
}

function measure(lat1, lon1, lat2, lon2) {
  // generally used geo measurement function
  const R = 6378.137; // Radius of earth in KM
  const dLat = (lat2 * Math.PI) / 180 - (lat1 * Math.PI) / 180;
  const dLon = (lon2 * Math.PI) / 180 - (lon1 * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d * 1000; // meters
}

exports.vehID = vehID;
exports.vehType = vehType;
exports.vehTypeStr = vehTypeStr;
exports.vehTypeObject = vehTypeObject;
exports.measure = measure;
