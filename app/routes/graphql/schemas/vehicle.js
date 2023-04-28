exports.Vehicle = `
type Vehicle {
    _id: String!
    numberPlate: String
    operator: Operator!
    line: String!
    type: Int!
    haveAds: Boolean!
    city_id: String
    city: City!
    latitude: Float!
    longitude: Float!
    installs: [Install!]!
    removes: [Remove!]!
    pictures: [Picture!]!
    listed: Boolean!
    visible: Boolean!
    totalAds: Int!
}`;

exports.Queries = `
    vehicle(_id: String): Vehicle
    vehiclesForInstallers(search: String, skip:Int, active: Boolean): [Vehicle!]!
    activeVehicles(search: String, skip:Int): [Vehicle!]!
    vehicleInstalls(_id: String!): [Install!]!
    vehicleCampaigns(_id: String!): [Campaign!]!
`;

exports.Mutations = `
    vehicleUpdate(_id: String!, numberPlate: String): Vehicle!
`;
