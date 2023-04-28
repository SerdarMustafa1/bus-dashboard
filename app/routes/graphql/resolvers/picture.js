const { AuthCheck } = require('../util/error');
const Picture = require('../../../models/mysql/picture');
const { SQLRowAsync } = require('../../../models/queryTools');

module.exports = {
  pictureDelete: async (args, req) => {
    AuthCheck(req);
    const { id } = args;

    try {
      const pic = await SQLRowAsync('Picture', { id });
      if (pic.user_id !== req.userId && ![5, 11].includes(req.userId))
        return false;

      return await Picture.deleteOneAsync(pic.id);
    } catch (err) {
      console.log(err);
      return false;
    }
  },
};
