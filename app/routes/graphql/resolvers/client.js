const Joi = require('@hapi/joi');
const shortId = require('shortid');

const Client = require('../../../models/mysql/client');
const Activity = require('../../../models/mysql/activity');
const client_dyn = require('../dynamic').client;
const clients_dyn = require('../dynamic').clients;

const {
  AuthCheck,
  PermissionCheck,
  SchemaValidator,
} = require('../util/error');

// const sql = require('../../../db');
const { SQLRowAsync } = require('../../../models/queryTools');
const ActivityTypes = require('../../../models/activityTypes');

const { joi_id } = require('../util/check');

const clientCreateSchema = Joi.object({
  company: Joi.string().required(),
  person: Joi.string().min(3).max(255).required(),
  email: Joi.string().allow('').email(),
  phone: Joi.string().allow(''),
  user: joi_id,
});

const clientEditSchema = Joi.object({
  _id: joi_id,
  company: Joi.string().min(3).max(255).required(),
  person: Joi.string().min(3).max(255).required(),
  email: Joi.string().allow('').email(),
  phone: Joi.string().allow(''),
  user: joi_id,
});

module.exports = {
  client: async (args, req) => {
    AuthCheck(req);
    const { _id } = args;
    if (!shortId.isValid(_id)) return null;
    return client_dyn(_id, req);
  },
  clients: async (args, req) => {
    AuthCheck(req);
    return clients_dyn({}, req);
  },
  clientCreate: async (args, req) => {
    PermissionCheck(req, [3, 5]);
    try {
      const data = SchemaValidator(clientCreateSchema, {
        ...args,
        user: req.userId,
      });
      const checkClient = await SQLRowAsync(
        'Client',
        { company: data.company },
        '_id'
      );
      console.log('data', data);
      console.log('client.clientCreate.checkClient');
      if (checkClient) return null;

      const object = new Client({
        company: data.company,
        person: data.person,
      });

      if (data.email) object.email = data.email;
      if (data.phone) object.phone = data.phone;
      await Client.createAsync(object);

      Activity.create(
        new Activity({
          user1_id: data.user,
          client_id: object._id,
          activityType: ActivityTypes.CLIENT.NEW,
        }),
        (err) => (err ? console.log(err) : undefined)
      );

      return { ...object };
    } catch (err) {
      console.log(err);
      return null;
    }
  },
  clientUpdate: async (args, req) => {
    PermissionCheck(req, [3, 5]);
    try {
      const data = SchemaValidator(clientEditSchema, {
        ...args,
        user: req.userId,
      });

      const object = await SQLRowAsync('Client', { _id: data._id });
      if (!object) return null;

      if (data.company !== object.company) {
        const checkClient = await SQLRowAsync(
          'Client',
          { company: data.company },
          '_id'
        );

        if (!checkClient) {
          Activity.create(
            new Activity({
              user1_id: data.user,
              client_id: object._id,
              string1: object.company,
              string2: data.company,
              activityType: ActivityTypes.CLIENT.EDIT.COMPANY,
            }),
            (err) => (err ? console.log(err) : undefined)
          );

          object.company = data.company;
        } else {
          console.log(
            'Error Client Edit: Company with that name already exist!'
          );
        }
      }
      if (data.person !== object.person) {
        Activity.create(
          new Activity({
            user1_id: data.user,
            client_id: object._id,
            string1: object.person,
            string2: data.person,
            activityType: ActivityTypes.CLIENT.EDIT.PERSON,
          }),
          (err) => (err ? console.log(err) : undefined)
        );

        object.person = data.person;
      }
      if (data.email !== object.email) {
        Activity.create(
          new Activity({
            user1_id: data.user,
            client_id: object._id,
            string1: object.email,
            string2: data.email,
            activityType: ActivityTypes.CLIENT.EDIT.EMAIL,
          }),
          (err) => (err ? console.log(err) : undefined)
        );

        object.email = data.email;
      }
      if (data.phone !== object.phone) {
        Activity.create(
          new Activity({
            user1_id: data.user,
            client_id: object._id,
            string1: object.phone,
            string2: data.phone,
            activityType: ActivityTypes.CLIENT.EDIT.PHONE,
          }),
          (err) => (err ? console.log(err) : undefined)
        );

        object.phone = data.phone;
      }
      await Client.updateAsync(object._id, object);
      return { ...object };
    } catch (err) {
      console.log(err);
      return null;
    }
  },
  clientDelete: async (args, req) => {
    PermissionCheck(req, [10]);
    const { _id } = args;
    if (shortId.isValid(_id)) return null;

    try {
      const object = await SQLRowAsync('Client', { _id, isDeleted: 0 }, '_id');
      if (!object) return null;

      await Client.updateAsync(object._id, { isDeleted: 1 });

      Activity.create(
        new Activity({
          user1_id: req.userId,
          client_id: object._id,
          activityType: ActivityTypes.CLIENT.DELETE,
        }),
        (err) => (err ? console.log(err) : undefined)
      );

      return { ...object };
    } catch (err) {
      console.log(err);
      return null;
    }
  },
  clientHardDelete: async (args, req) => {
    PermissionCheck(req, [5, 11]);
    const { _id } = args;
    try {
      return await Client.deleteOneAsync(_id);
    } catch (err) {
      console.log(err);
      return null;
    }
  },
};
