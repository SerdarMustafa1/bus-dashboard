exports.Activity = `
type Activity {
    _id: ID!
    message: String!
    activityType: String!
    created_at: String!
}`;

exports.History = `
type History {
    id: Int!
    user: User!
    vehicle: Vehicle!
    campaign: Campaign!
    placement: Placement!
    remove: Remove
    install: Install
    activityType: String!
    created_at: String!
}`;

exports.Queries = `
    activity(_id:ID): Activity 
    activities(types:[String!], skip:Int, limit:Int): [Activity!]!
    vehicleActivities(_id:ID!, types:[String!], skip:Int, limit:Int): [Activity!]!
    history(search:String,skip:Int, all:Boolean): [History!]!
`;

// user1: User
// user2: User
// client: Client
// campaign: Campaign
// operator: Operator
// placement: Placement
// installation: Installation
// uninstallation: Uninstallation
// strValue1: String
// strValue2: String
// activityType: String
