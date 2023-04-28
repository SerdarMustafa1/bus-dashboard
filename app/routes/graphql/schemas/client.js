exports.Client = `
type Client {
    _id: ID!
    company: String!
    person: String!
    email: String
    phone: String
    campaigns: [Campaign!]!
    isDeleted: Boolean!
    created_at: String!
    updated_at: String!
}`;

exports.Queries = `
    client(_id:ID): Client
    clients: [Client!]!
`;

exports.Mutations = `
    clientCreate(company: String!, person: String!, email: String, phone: String): Client!
    clientUpdate(_id: ID!, company: String, person: String, email: String, phone: String): Client!
    clientDelete(_id: ID!): Client!
    
    clientHardDelete(_id: ID!): Boolean!
`;
