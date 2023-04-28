exports.Team = `
type Team {
    _id: ID!
    company: String!
    created_at: String!
    updated_at: String!
}`;

exports.Queries = `
    team(_id:ID): Team
    teams: [Team!]!
`;

exports.Mutations = `
    teamCreate(company: String!): Team!
    teamUpdate(_id: ID!, company: String): Team!
    teamDelete(_id: ID!): Boolean!
    
    teamHardDelete(_id: ID!): Boolean!
`;
