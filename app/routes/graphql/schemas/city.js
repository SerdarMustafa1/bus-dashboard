exports.City = `
type City {
    _id: ID!
    name: String!
    short: String!
    latitude: Float!
    longitude: Float!
    vehicles: [Vehicle!]!
    campaigns: [Campaign!]!
    operators: [Operator!]!
    operatorsAll: [Operator!]!
    users: [User!]!
}`;

exports.Queries = `
    city(_id: ID): City
    cities: [City!]!
    cityVehicles(_id: ID!): [Vehicle!]!
`;
