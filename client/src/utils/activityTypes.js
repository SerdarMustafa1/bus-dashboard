export default {
  CAMPAIGN: {
    NEW: 'campaign.new', //DONE user1 (creator)   campaign
    EDIT: {
      // user1 (changer)   campaign
      NAME: 'campaign.edit.name', //DONE user1 (changer)  campaign  strValue1 (oldVal) strValue2 (newVal)
      CLIENT: 'campaign.edit.client', //DONE user1 (changer)  campaign  strValue1 (oldVal) strValue2 (newVal)
      BUDGET: 'campaign.edit.budget', //DONE user1 (changer)  campaign  strValue1 (oldVal) strValue2 (newVal)
      CITIES: 'campaign.edit.cities', //  user1 (changer)  campaign  strValue1 (oldVal) strValue2 (newVal)
      START_DATE: 'campaign.edit.start_date', //DONE user1 (changer)  campaign  strValue1 (oldVal) strValue2 (newVal)
      END_DATE: 'campaign.edit.end_date', //DONE user1 (changer)  campaign  strValue1 (oldVal) strValue2 (newVal)
    },
    NOTIFICATION: {
      PRE_START: 'campaign.notification.pre_start', // campaign
      START: 'campaign.notification.start', // campaign
      PRE_END: 'campaign.notification.pre_end', // campaign
      END: 'campaign.notification.end', // campaign
      INSTALLED: 'campaign.notification.installed', // campaign
      REMOVED: 'campaign.notification.removed', // campaign
    },
    SHARE: 'campaign.share',
    DELETE: 'campaign.del', // user1 (deleter)   campaign
  },
  PLACEMENT: {
    NEW: 'placement.new',
    EDIT: {
      COUNT: 'placement.edit.count',
    },
    DELETE: 'placement.del',
  },
  OPERATOR: {
    EDIT: {
      COMPANY: 'operator.edit.company', // user1 (changer)  operator  strValue1 (oldVal) strValue2 (newVal)
      LISTED: 'operator.edit.listed', // user1 (changer)  operator  strValue1 (oldVal) strValue2 (newVal)
    },
  },
  INSTALL: {
    NEW: 'install.new', //DONE user1 (installer)  installation fleet
    EDIT: {
      COUNT: 'install.edit.count', // user1 (changer)  installation  strValue1 (oldVal) strValue2 (newVal) fleet
    },
    DELETE: 'install.del', // user1  strValue1 (oldVal) strValue2 (newVal) fleet
  },
  REMOVE: {
    NEW: 'remove.new', // user1 (uninstaller)  installation fleet
    EDIT: {
      COUNT: 'remove.edit.count', // user1 (changer)  installation fleet
    },
    DELETE: 'remove.del', // user1 (deleter) installation fleet
    CLEAR: 'client.clear', //DONE user (deleter)  client
  },
  CLIENT: {
    NEW: 'client.new', //DONE user1 (creator)  client
    EDIT: {
      COMPANY: 'client.edit.company', //DONE user1 (changer)  client  strValue1 (oldVal) strValue2 (newVal)
      PERSON: 'client.edit.person', //DONE user1 (changer)  client  strValue1 (oldVal) strValue2 (newVal)
      EMAIL: 'client.edit.email', //DONE user1 (changer)  client  strValue1 (oldVal) strValue2 (newVal)
      PHONE: 'client.edit.phone', //DONE user1 (changer)  client  strValue1 (oldVal) strValue2 (newVal)
    },
    DELETE: 'client.del', //DONE user (deleter)  client
    CLEAR: 'client.clear', //DONE user (deleter)  client
  },
  FLEET: {
    EDIT: {
      NUMBERPLATE: 'fleet.edit.numberplate', //DONE user1 (changer) fleet strValue1 (oldVal) strValue2 (newVal)
    },
  },
  USER: {
    NEW: 'user.new', //DONE user1 (creator)  user2 (user)
    EDIT: {
      NAME: 'user.edit.name', //DONE user1 (chagner-) user2 (user)  strValue1 (oldVal) strValue2 (newVal)
      PHONE: 'user.edit.phone', //DONE user1 (chagner-) user2 (user)  strValue1 (oldVal) strValue2 (newVal)
      ROLE: 'user.edit.role', //DONE user1 (chagner-) user2 (user)  strValue1 (oldId) strValue2 (newId)
      CITY: 'user.edit.city', //DONE user1 (chagner-) user2 (user)  strValue1 (oldId) strValue2 (newId)
      EMAIL: 'user.edit.email', //DONE user1 (chagner-) user2 (user)  strValue1 (oldVal) strValue2 (newVal)
      PASSWORD: 'user.edit.pass', //DONE user1 (chagner-)
    },
    DELETE: 'user.del', //DONE user1 (deleter-) user2 (user)
    CLEAR: 'user.clear', //DONE user (deleter)  user2 (user)
  },
};
