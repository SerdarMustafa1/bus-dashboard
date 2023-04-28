const Activity = require('../models/mysql/activity');
const ActivityTypes = require('../models/activityTypes');

const Campaign = require('../models/mysql/campaign');
const User = require('../models/mysql/user');
const Placement = require('../models/mysql/placement');

const schedule = require('node-schedule');
const { mailgun } = require('../config/site');

var three_day = 1000 * 60 * 60 * 24 * 3;
const rule = new schedule.RecurrenceRule();

rule.hour = [7, 10];
rule.minute = 0;
rule.second = 0;

const actTypeToMailType = {};
actTypeToMailType[ActivityTypes.CAMPAIGN.NOTIFICATION.PRE_START] =
  'mailPreStart';
actTypeToMailType[ActivityTypes.CAMPAIGN.NOTIFICATION.START] = 'mailStart';
actTypeToMailType[ActivityTypes.CAMPAIGN.NOTIFICATION.PRE_END] = 'mailPreEnd';
actTypeToMailType[ActivityTypes.CAMPAIGN.NOTIFICATION.END] = 'mailEnd';

async function getPeople(cities, type) {
  if (!cities || cities.lenght === 0) {
    console.log('Cant send meils without cities defined!');
    return [];
  }

  const mailType = actTypeToMailType[type];

  const query = { city: { $in: cities }, emailValidation: true };
  query[mailType] = true;

  const users = await User.find(query).select('email').lean();

  if (!users) return [];
  return users;
}

async function sendMail(campaign, type) {
  const users = await getPeople(campaign.cities, type);
  const placements = await Placement.find({ campaign })
    .populate('place')
    .select('place count')
    .lean();

  // const mail = {
  //     from: '<no-reply@dashboard.laulavaovipumppu.fi>',
  //     subject: 'Hello',
  //     template: '',
  //   };

  //   mail.text = `Campaign includes:\n${placements.map(placement => `${placement.count} x ${placement.place.name}`).join('\n')}`;

  // if (type === ActivityTypes.CAMPAIGN.NOTIFICATION.PRE_START) {
  //   mail.subject = `${campaign.creator.name} created campaign ${campaign.name} which starts on ${new Date(parseInt(campaign.startDate)).getUTCDate()}.`;
  // } else if (type === ActivityTypes.CAMPAIGN.NOTIFICATION.START) {
  //   mail.subject = `${campaign.creator.name} created campaign ${campaign.name} which started on ${new Date(parseInt(campaign.startDate)).getUTCDate()}.`;
  // } else if (type === ActivityTypes.CAMPAIGN.NOTIFICATION.PRE_END) {
  //   mail.subject = `${campaign.creator.name} created campaign ${campaign.name} which ends on ${new Date(parseInt(campaign.startDate)).getUTCDate()}.`;
  // } else if (type === ActivityTypes.CAMPAIGN.NOTIFICATION.END) {
  //   mail.subject = `${campaign.creator.name} created campaign ${campaign.name} which ended on ${new Date(parseInt(campaign.startDate)).getUTCDate()}.`;
  // }

  for (const user of users) {
    console.log('Sending mail to user', user);
    //     mail.to = 'kauririivik@gmail.com', // user.email later

    // mailgun.messages().send(mail, function (error, body) {
    //   console.log(body);
    // });
  }
}

async function notify(campaign, type) {
  sendMail(campaign, type);

  // (new Activity({
  //   campaign,
  //   activityType: type,
  // })).save();
}

async function runner() {
  try {
    const campaigns = await Campaign.find({
      $or: [
        { preStart: false },
        { isStarted: false },
        { preEnd: false },
        { isEnded: false },
      ],
    })
      .select('-client -budget -isPublic -isDeleted -createdAt -updatedAt')
      .populate({ path: 'creator', select: 'name' });

    for (const campaign of campaigns) {
      const startDate = campaign.startDate;
      const endDate = campaign.endDate;

      if (!campaign.preStart && Date.now() + three_day > startDate) {
        // In 72Hours
        console.log('In 3d campaign starts');
        notify(campaign, ActivityTypes.CAMPAIGN.NOTIFICATION.PRE_START);
        campaign.preStart = true;
        // await campaign.save()
      }
      if (!campaign.isStarted && Date.now() > startDate) {
        // Start passed
        console.log('Campaign started');
        notify(campaign, ActivityTypes.CAMPAIGN.NOTIFICATION.START);
        campaign.isStarted = true;
        // await campaign.save()
      }
      if (!campaign.preEnd && Date.now() + three_day > endDate) {
        // In 72Hours
        console.log('In 3d campaign ends');
        notify(campaign, ActivityTypes.CAMPAIGN.NOTIFICATION.PRE_END);
        campaign.preEnd = true;
        // await campaign.save()
      }
      if (!campaign.isEnded && Date.now() > endDate) {
        // End passed
        console.log('Campaign ended');
        notify(campaign, ActivityTypes.CAMPAIGN.NOTIFICATION.END);
        campaign.isEnded = true;
        // await campaign.save()
      }
    }
  } catch (err) {
    console.log('Error in CampaignRunner:', err.toString());
  }
}

module.exports = () => {
  schedule.scheduleJob(rule, runner);
  runner();
};
