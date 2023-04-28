const { buildSchema } = require('graphql');

const actionsSchema = require('./schemas/actions');
const activitySchema = require('./schemas/activity');
const campaignSchema = require('./schemas/campaign');
const citySchema = require('./schemas/city');
const clientSchema = require('./schemas/client');
const installSchema = require('./schemas/install');
const installerSchema = require('./schemas/installer');
const installOrderSchema = require('./schemas/installOrder');
const pictureSchema = require('./schemas/picture');
const placeSchema = require('./schemas/place');
const placementSchema = require('./schemas/placement');
const operatorSchema = require('./schemas/operator');
const removeSchema = require('./schemas/remove');
const userSchema = require('./schemas/user');
const teamSchema = require('./schemas/team');
const vehicleSchema = require('./schemas/vehicle');

const fullSchema = `
${activitySchema.Activity}
${activitySchema.History}

${campaignSchema.Campaign}

${citySchema.City}

${clientSchema.Client}

${installSchema.Install}

${installerSchema.Installer}

${installOrderSchema.InstallOrder}

${operatorSchema.Operator}

${pictureSchema.Picture}

${placeSchema.Place}

${placementSchema.Placement}

${removeSchema.Remove}

${userSchema.User}

${teamSchema.Team}

${vehicleSchema.Vehicle}

type RootQuery {
    ${activitySchema.Queries}
    ${campaignSchema.Queries}
    ${citySchema.Queries}
    ${clientSchema.Queries}
    ${installSchema.Queries}
    ${installerSchema.Queries}
    ${installOrderSchema.Queries}
    ${operatorSchema.Queries}
    ${pictureSchema.Queries}
    ${placeSchema.Queries}
    ${placementSchema.Queries}
    ${removeSchema.Queries}
    ${userSchema.Queries}
    ${teamSchema.Queries}
    ${vehicleSchema.Queries}
}

type RootMutation {
    ${actionsSchema.Mutations}
    ${campaignSchema.Mutations}
    ${clientSchema.Mutations}
    ${installSchema.Mutations}
    ${installerSchema.Mutations}
    ${installOrderSchema.Mutations}
    ${operatorSchema.Mutations}
    ${pictureSchema.Mutations}
    ${placeSchema.Mutations}
    ${removeSchema.Mutations}
    ${userSchema.Mutations}
    ${teamSchema.Mutations}
    ${vehicleSchema.Mutations}
}

schema {
    query: RootQuery
    mutation: RootMutation
}`;

// console.log(fullSchema);

module.exports = buildSchema(fullSchema);
