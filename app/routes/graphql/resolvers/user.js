const Joi = require('@hapi/joi');
const User = require('../../../models/mysql/user');
const Activity = require('../../../models/mysql/activity');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const user_dyn = require('../dynamic').user;

const sql = require('../../../db');
const { SQLRowAsync } = require('../../../models/queryTools');
const ActivityTypes = require('../../../models/activityTypes');

const {
  AuthCheck,
  PermissionCheck,
  SchemaValidator,
} = require('../util/error');

const { JWTSecret } = require('../../../config/keys');
const crypto = require('crypto');

const emailValidation = require('../../../utils/emailValidation');
const {
  newUserEmail,
  passwordRecoveryEmail,
} = require('../../../utils/emails');
const shortId = require('shortid');

const mailingTypes = [
  'mailCampCreated',
  'mailCampChanged',
  'mailPreStart',
  'mailStart',
  'mailPreEnd',
  'mailEnd',
  'mailInstallDone',
  'mailRemoveDone',
];
const legitRoles = [0, 1, 3, 5, 11];

const tokenExpInDays = 7;

// Todo: Joi checks
const { joi_id, joi_idOpt } = require('../util/check');
const recoverySchema = Joi.object({
  email: Joi.string().email().required(),
});
const userCreateSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(3).max(255).required(),
  role: Joi.number().integer(),
  phone: Joi.string().allow('').max(255),
  city: joi_idOpt,
});

const userTokenGenerator = (id, name, role, installer) => {
  return jwt.sign(
    {
      userId: id,
      userName: name,
      userRole: role,
      installerId: installer,
    },
    JWTSecret,
    {
      expiresIn: `${tokenExpInDays}d`,
    }
  );
};

module.exports = {
  user: async (args, req) => {
    PermissionCheck(req, [5]);
    const { _id } = args;
    return await user_dyn(_id, req);
  },
  login: async (args) => {
    const { email, password } = args;

    try {
      const user = await SQLRowAsync(
        'User',
        { email, isDeleted: 0 },
        '_id, name, password, role'
      );
      if (!user) return null;
      if (!(await bcrypt.compare(password, user.password))) return null;

      const installer = await SQLRowAsync(
        'Installer',
        { user_id: user._id, isActive: 1 },
        '_id'
      );
      if (installer)
        return userTokenGenerator(
          user._id,
          user.name,
          user.role,
          installer._id
        );

      return userTokenGenerator(user._id, user.name, user.role);
    } catch (err) {
      console.log(err);
      return null;
    }
  },
  tokenValidate: async (_, req) => {
    AuthCheck(req);
    if (req.userRole === 0 || (5 && !req.installerId)) {
      const installer = await SQLRowAsync(
        'Installer',
        { user_id: req.userId, isActive: 1 },
        '_id'
      );
      if (installer)
        return userTokenGenerator(
          req.userId,
          req.userName,
          req.userRole,
          installer._id
        );
    }
    return userTokenGenerator(
      req.userId,
      req.userName,
      req.userRole,
      req.installerId
    );
  },
  passwordRecovery: async (args) => {
    try {
      const data = SchemaValidator(recoverySchema, { ...args });

      const user = await User.getUserByEmailAsync(data.email);
      if (!user) return true;

      user.passwordToken = (await crypto.randomBytes(20)).toString('hex');
      user.passwordTokenExpires = new Date(Date.now() + 3600000);

      await User.updateAsync(user._id, user);
      return await passwordRecoveryEmail(user);
    } catch (err) {
      console.log('Error Password Recovery', err);
      return false;
    }
  },
  recoveryValidate: async (args) => {
    const { token } = args;

    try {
      const user = await new Promise((resolve, reject) => {
        sql.query(
          'SELECT _id FROM User WHERE passwordToken = ? and PasswordTokenExpires >= ? LIMIT 1',
          [token, new Date(Date.now())],
          function (err, data) {
            if (err) reject(err);
            if (data.length > 0) resolve(data[0]);
            else resolve(null);
          }
        );
      });
      if (!user) return null;
      user.passwordToken = (await crypto.randomBytes(20)).toString('hex');
      user.passwordTokenExpires = new Date(Date.now() + 1800000);
      const data = await User.updateAsync(user._id, user);
      return data.passwordToken;
    } catch (err) {
      console.log('Error in recoveryValidate', err);
      return null;
    }
  },
  resetPassword: async (args) => {
    const { token, password } = args;
    if (!token || password.length < 3) return false;
    try {
      const user = await new Promise((resolve) => {
        sql.query(
          'SELECT _id, password FROM User Where passwordToken = ? AND passwordTokenExpires>= ?',
          [token, new Date()],
          (err, data) => {
            if (err) resolve(null);
            if (data && data.length > 0) resolve(data[0]);
            else resolve(null);
          }
        );
      });
      if (!user) return false;
      const hashedPassword = await bcrypt.hash(password, 12);

      return await new Promise((resolve, reject) => {
        sql.query(
          `UPDATE User SET password = ?, passwordToken = NULL, passwordTokenExpires = NULL  WHERE _id = ?`,
          [hashedPassword, user._id],
          (err) => {
            if (err) reject(err);
            else {
              Activity.create(
                new Activity({
                  user1_id: user._id,
                  activityType: ActivityTypes.USER.EDIT.PASSWORD,
                }),
                (err) => (err ? console.log(err) : undefined)
              );
              resolve(true);
            }
          }
        );
      });
    } catch (err) {
      console.log('Error?', err.toString());
      return false;
    }
  },
  userCreate: async (args, req) => {
    PermissionCheck(req, [5, 11]);

    const creator = req.userId;
    const { city } = args;

    if (city && !shortId.isValid(city)) return null;

    try {
      const data = SchemaValidator(userCreateSchema, { ...args });

      const checkUser = await SQLRowAsync(
        'User',
        { email: data.email.toLowerCase() },
        '_id'
      );
      if (checkUser) return null;

      if (!(await emailValidation(data.email))) return null;
      if (!legitRoles.includes(data.role)) return null;

      const newUser = new User({
        name: data.name,
        email: data.email.toLowerCase(),
        role: data.role,
      });

      if (data.phone) newUser.phone = data.phone;
      if (data.city) newUser.city_id = data.city;

      newUser.passwordToken = (await crypto.randomBytes(20)).toString('hex');
      newUser.passwordTokenExpires = new Date(Date.now() + 700000000); // 6,9Days

      await User.createAsync(newUser);
      if (!(await newUserEmail(newUser))) return null;

      Activity.create(
        new Activity({
          user1_id: creator,
          user2_id: newUser._id,
          activityType: ActivityTypes.USER.NEW,
        }),
        (err) => (err ? console.log(err) : undefined)
      );

      return { ...newUser, password: null, passwordToken: null };
    } catch (err) {
      console.log(err);
      return null;
    }
  },
  userUpdate: async (args, req) => {
    AuthCheck(req);
    const { _id, name, email, role, phone, city } = args;

    if (city && !shortId.isValid(city)) return null;

    let isAdmin = false;
    if (_id) {
      PermissionCheck(req, [5]);
      isAdmin = true;
    }
    const userId = _id || req.userId;

    try {
      const object = await SQLRowAsync('User', { _id: userId });
      if (!object) return null;

      if (email.toLowerCase() !== object.email) {
        const checkUser = SQLRowAsync('User', { email }, '_id');
        if (!checkUser) {
          if (await emailValidation(email)) {
            Activity.create(
              new Activity({
                user1_id: req.userId,
                user2_id: object._id,
                string1: object.email,
                string2: email,
                activityType: ActivityTypes.USER.EDIT.EMAIL,
              }),
              (err) => (err ? console.log(err) : undefined)
            );

            object.email = email;
            object.emailValidation = true;
          } else {
            console.log('Email is not valid');
          }
        }
      }
      if (role !== object.role && isAdmin && legitRoles.includes(role)) {
        Activity.create(
          new Activity({
            user1_id: req.userId,
            user2_id: object._id,
            string1: object.role,
            string2: role,
            activityType: ActivityTypes.USER.EDIT.ROLE,
          }),
          (err) => (err ? console.log(err) : undefined)
        );
        object.role = role;
      }
      if (city !== object.city_id) {
        if (await SQLRowAsync('City', { _id: city }, '_id')) {
          Activity.create(
            new Activity({
              user1: req.userId,
              user2: object._id,
              string1: object.city_id,
              string2: city,
              activityType: ActivityTypes.USER.EDIT.CITY,
            }),
            (err) => (err ? console.log(err) : undefined)
          );
          object.city_id = city;
        }
      }

      if (name !== object.name) {
        Activity.create(
          new Activity({
            user1_id: req.userId,
            user2_id: object._id,
            string1: object.name,
            string2: name,
            activityType: ActivityTypes.USER.EDIT.NAME,
          }),
          (err) => (err ? console.log(err) : undefined)
        );
        object.name = name;
      }

      if (phone !== object.phone) {
        Activity.create(
          new Activity({
            user1_id: req.userId,
            user2_id: object._id,
            string1: object.phone,
            string2: phone,
            activityType: ActivityTypes.USER.EDIT.PHONE,
          }),
          (err) => (err ? console.log(err) : undefined)
        );
        object.phone = phone;
      }

      await User.updateAsync(object._id, object);

      return { ...object, password: null };
    } catch (err) {
      console.log(err);
      return null;
    }
  },
  userMailing: async (args, req) => {
    PermissionCheck(req, [5]);
    const { _id, mail, value } = args;

    try {
      const object = await SQLRowAsync('User', { _id, isDeleted: 0 }, '_id');
      if (!object) return false;

      if (typeof mail !== 'string') return false;
      if (typeof value !== 'boolean') return false;
      if (!mailingTypes.includes(mail)) return false;
      object[mail] = value;
      await User.updateAsync(object._id, object);

      return true;
    } catch (err) {
      console.log('Emailing update failed', err.toString());
      return false;
    }
  },
  userDelete: async (args, req) => {
    PermissionCheck(req, [5]);
    const { _id } = args;

    try {
      const object = await SQLRowAsync('User', { _id, isDeleted: 0 }, '_id');
      if (!object) return false;

      await User.updateAsync(object._id, { isDeleted: 1 });

      Activity.create(
        new Activity({
          user1_id: req.userId,
          user2_id: object._id,
          activityType: ActivityTypes.USER.DELETE,
        }),
        (err) => (err ? console.log(err) : undefined)
      );

      return { ...object, password: null };
    } catch (err) {
      console.log(err);
      return null;
    }
  },
  userHardDelete: async (args, req) => {
    //
    PermissionCheck(req, [5, 11]);
    const { _id } = args;
    try {
      return await User.deleteOneAsync(_id);
    } catch (err) {
      console.log(err);
      return false;
    }
  },
};
