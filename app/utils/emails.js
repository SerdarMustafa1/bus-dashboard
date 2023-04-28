const emailValidation = require('./emailValidation');
const { mailgun } = require('./../config/site');

const util = require('util');
const t = require('./translator');

// const actTypeToMailType = {};
// actTypeToMailType[ActivityTypes.CAMPAIGN.NOTIFICATION.PRE_START] = "mailPreStart"
// actTypeToMailType[ActivityTypes.CAMPAIGN.NOTIFICATION.START] = "mailStart"
// actTypeToMailType[ActivityTypes.CAMPAIGN.NOTIFICATION.PRE_END] = "mailPreEnd"
// actTypeToMailType[ActivityTypes.CAMPAIGN.NOTIFICATION.END] = "mailEnd"
// actTypeToMailType[ActivityTypes.CAMPAIGN.NOTIFICATION.INSTALLED] = "mailInstallDone"
// actTypeToMailType[ActivityTypes.CAMPAIGN.NOTIFICATION.UNINSTALLED] = "mailUninstallDone"

const url = 'https://dashboard.laulavaovipumppu.fi';

const sendEmailAsync = async (mailData) => {
  return new Promise((resolve) => {
    mailgun.messages().send(mailData, function (error) {
      if (error) console.log(error);
      resolve(!!!error);
    });
  });
};

module.exports = {
  newUserEmail: async (user) => {
    if (await emailValidation(user.email)) {
      const lang = 'en';
      return await sendEmailAsync({
        from: 'Laulava Ovipumppu <no-reply@dashboard.laulavaovipumppu.fi>',
        to: user.email,
        subject: t('email.new_account.subject', lang),
        template: 'ovipumppumail',
        'h:X-Mailgun-Variables': JSON.stringify({
          title: t('email.new_account.title', lang),
          preDescription1: t('email.new_account.pre_des1', lang),
          preDescription2: t('email.new_account.pre_des2', lang),
          actionLink: `${url}/new_password/${user.passwordToken}`,
          actionText: t('email.new_account.action', lang),
        }),
      });
    }
  },
  passwordRecoveryEmail: async (user) => {
    if (await emailValidation(user.email)) {
      const lang = user.lang;
      return await sendEmailAsync({
        from: 'Laulava Ovipumppu <no-reply@dashboard.laulavaovipumppu.fi>',
        to: user.email,
        subject: t('email.forget_password.subject', lang),
        template: 'ovipumppumail',
        'h:X-Mailgun-Variables': JSON.stringify({
          title: t('email.forget_password.pre_des1', lang),
          preDescription1: t('email.forget_password.pre_des1', lang),
          actionLink: `${url}/new_password/${user.passwordToken}`,
          actionText: t('email.forget_password.action', lang),
          postDescription: t('email.forget_password.pos_des1', lang),
        }),
      });
    }
  },
  campaignShareEmail: async (campaign, pass, to) => {
    if (await emailValidation(to)) {
      return await sendEmailAsync({
        from: 'Laulava Ovipumppu <no-reply@dashboard.laulavaovipumppu.fi>',
        to: to,
        subject: util.format('', campaign.name),
        template: `ovipumppumail`,
        'h:X-Mailgun-Variables': JSON.stringify({
          title: `${campaign.name}`,
          preDescription1: t('email.campaign_share.pre_des1'),
          preDescription2: `${pass}`,
          actionLink: `${url}/campaign/${campaign._id}`,
          actionText: t('email.campaign_share.action'),
        }),
      });
    }
  },

  campaignCreateEmail: async (creator) => {
    return true;
    // Todo: email
    const lang = 'en';
    const mailData = {
      from: 'Laulava Ovipumppu <no-reply@dashboard.laulavaovipumppu.fi>',
      to: 'kauririivik@gmail.com', // user.email later
      subject: `New campaign has been created by ${creator}`,
      template: 'ovipumppumail',
      'h:X-Mailgun-Variables': JSON.stringify({
        title: `${creator} created campaign ${campaign.name}.`,
        preDescription: 'Your new account has been created!',
        preDescription2:
          'Click on the button to create password for the login:',
        actionLink: `https://dashboard.laulavaovipumppu.fi/new_password/${token}`,
        actionText: 'Create password',
      }),
    };
  },
  campaignEditEmail: async (campaign) => {
    return true;
    // Todo: email
    const lang = 'en';
    const mailData = {
      from: 'Laulava Ovipumppu <no-reply@dashboard.laulavaovipumppu.fi>',
      to: 'kauririivik@gmail.com', // user.email later
      subject: `${changer} edited a campaign`,
      template: 'ovipumppumail',
      'h:X-Mailgun-Variables': JSON.stringify({
        title: `${changer} edited campaign ${campaign.name}.`,
        preDescription: 'Your new account has been created!',
        preDescription2:
          'Click on the button to create password for the login:',
        actionLink: `https://dashboard.laulavaovipumppu.fi/new_password/${token}`,
        actionText: 'Create password',
      }),
    };
  },
  campaignInstallDoneEmail: async () => {
    return true;
    // Todo: email
    const lang = 'en';
    const mailData = {
      from: 'Laulava Ovipumppu <no-reply@dashboard.laulavaovipumppu.fi>',
      to: 'kauririivik@gmail.com', // user.email later
      subject: `Installation of campaign ${campaign.name} is finished!`,
      template: 'ovipumppumail',
      'h:X-Mailgun-Variables': JSON.stringify({
        title: 'Installation finished!',
        preDescription1: `This is a notification that the installation of campaign ${camapign.name} is done and ready to go.`,
        preDescription2: 'Follow the campaign in real-time:',
        actionLink: `https://dashboard.laulavaovipumppu.fi/dashboard/campaign/${campaign._id}`,
        actionText: 'Follow campaign',
      }),
    };
  },
  campaignPreStartEmail: async () => {
    return true;
    // Todo: email
    const lang = 'en';
    const mailData = {
      from: 'Laulava Ovipumppu <no-reply@dashboard.laulavaovipumppu.fi>',
      to: 'kauririivik@gmail.com', // user.email later
      subject: `Campaign <campaign name> ends in 3 days`,
      template: 'ovipumppumail',
      'h:X-Mailgun-Variables': JSON.stringify({
        title: 'Welcome!',
        preDescription1: 'Your new account has been created!',
        preDescription2:
          'Click on the button to create password for the login:',
        actionLink: `https://dashboard.laulavaovipumppu.fi/new_password/${token}`,
        actionText: 'Create password',
      }),
    };
  },
  campaignStartEmail: async () => {
    return true;
    // Todo: email
    const lang = 'en';
    const mailData = {
      from: 'Laulava Ovipumppu <no-reply@dashboard.laulavaovipumppu.fi>',
      to: 'kauririivik@gmail.com', // user.email later
      subject: 'New account created!',
      template: 'ovipumppumail',
      'h:X-Mailgun-Variables': JSON.stringify({
        title: 'Welcome!',
        preDescription1: 'Your new account has been created!',
        preDescription2:
          'Click on the button to create password for the login:',
        actionLink: `https://dashboard.laulavaovipumppu.fi/new_password/${token}`,
        actionText: 'Create password',
      }),
    };
  },

  campaignUninstallDoneEmail: async () => {
    return true;
    // Todo: email
    const lang = 'en';
    const mailData = {
      from: 'Laulava Ovipumppu <no-reply@dashboard.laulavaovipumppu.fi>',
      to: 'kauririivik@gmail.com', // user.email later
      subject: `Ad placements of campaign ${campaign.name} have been successfully removed`,
      template: 'ovipumppumail',
      'h:X-Mailgun-Variables': JSON.stringify({
        title: 'Welcome!',
        preDescription1: `This is a notification that the removal of ad placements for campaign ${camapign.name} is finished.`,
        preDescription2:
          'Click on the button to create password for the login:',
        actionLink: `https://dashboard.laulavaovipumppu.fi/new_password/${token}`,
        actionText: 'Create password',
      }),
    };
  },
  campaignPreEndEmail: async () => {
    return true;
    // Todo: email
    const lang = 'en';
    const mailData = {
      from: 'Laulava Ovipumppu <no-reply@dashboard.laulavaovipumppu.fi>',
      to: 'kauririivik@gmail.com', // user.email later
      subject: `Campaign ${campaign.name} ends in 3 days`,
      template: 'ovipumppumail',
      'h:X-Mailgun-Variables': JSON.stringify({
        title: 'Welcome!',
        preDescription1: 'Your new account has been created!',
        preDescription2:
          'Click on the button to create password for the login:',
        actionLink: `https://dashboard.laulavaovipumppu.fi/new_password/${token}`,
        actionText: 'Create password',
      }),
    };
  },
  campaignEndEmail: async (campaign, creator) => {
    return true;
    // Todo: email
    const lang = 'en';
    const mailData = {
      from: 'Laulava Ovipumppu <no-reply@dashboard.laulavaovipumppu.fi>',
      to: 'kauririivik@gmail.com', // user.email later
      subject: `Campaign ${campaign.name} ends today`,
      template: 'ovipumppumail',
      'h:X-Mailgun-Variables': JSON.stringify({
        title: 'Welcome!',
        preDescription1: `This is a notification that the campaign ${campaing.name} ends today and placements need to be removed.`,
        preDescription2: `Campaign was created by ${creator.name}.`,
        actionLink: `https://dashboard.laulavaovipumppu.fi/new_password/${token}`,
        actionText: 'Create password',
      }),
    };
  },
};
