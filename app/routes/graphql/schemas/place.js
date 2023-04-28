exports.Place = `
type Place {
    _id: ID!
    name: String!
    placements: [Placement!]!
}`;

exports.Queries = `
    place(_id: ID): Place
    places(name: String): [Place!]!
`;

exports.Mutations = `
    placeCreate(name: String!): Place!
    placeUpdate(_id: ID!, name: String!): Place!
    placeDelete(_id: ID!): Place!
`;
