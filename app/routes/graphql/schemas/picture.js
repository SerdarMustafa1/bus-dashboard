exports.Picture = `
type Picture {
    id: Int!
    user_id: String
    user: User
    campaign_id: String
    campaign: Campaign!
    path: String!
    thumbnail: String
    created_at: String!
}`;

exports.Queries = `
`;

exports.Mutations = `
    pictureDelete(id: ID!): Boolean!
`;
