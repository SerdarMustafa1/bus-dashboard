exports.Operator = `
type Operator {
    _id: ID!
    operatorId: String!
    company: String
    vehicles: [Vehicle!]!
    city_id: String
    city: City!
    listed: Boolean!
    visible: Boolean!
}`;

exports.Queries = `
    operator(_id:ID): Operator
    operatorVehicles(_id:ID!): [Vehicle!]!
`;

exports.Mutations = `
    operatorUpdate(_id:ID!, company: String, listed: Boolean, visible: Boolean): Operator!
`;
