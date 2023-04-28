const Place = require('../../../models/mysql/place');
const place_dyn = require('../dynamic').place;
const places_dyn = require('../dynamic').places;

const { PermissionCheck } = require('../util/error');
const { SQLRowAsync } = require('../../../models/queryTools');

module.exports = {
  place: async (args, req) => {
    PermissionCheck(req, [3, 5]);
    const { _id } = args;
    return place_dyn(_id, req);
  },
  places: async (_, req) => {
    PermissionCheck(req, [3, 5]);
    return places_dyn({}, req);
  },
  placeCreate: async (args, req) => {
    PermissionCheck(req, [5]);
    const { name } = args;
    try {
      const similar = SQLRowAsync('Place', { name }, '_id');
      if (similar) return null;
      const object = new Place({ name });
      await Place.createAsync(object);
      return { ...object };
    } catch (err) {
      console.log(err);
      return null;
    }
  },
  placeUpdate: async (args, req) => {
    PermissionCheck(req, [5]);
    const { _id, name } = args;
    try {
      const object = await SQLRowAsync('Place', { _id }, '_id name');
      if (name === object.name) return null;
      const similar = await SQLRowAsync('Place', { name }, '_id');
      if (similar) return null;
      const result = await Place.updateAsync(object._id, { name });

      return { ...result };
    } catch (err) {
      throw err;
    }
  },
};
