exports.Placement = `
type Placement {
    _id: ID!
    place_id: String
    place: Place!
    campaign_id: String
    campaign: Campaign!
    count: Int!
    isPublic: Boolean!
    installs: [Install!]!
    removes: [Remove!]!
    installOrders: [InstallOrder!]!
    created_at: String!
    updated_at: String!
}`;

exports.Queries = `
    placementsForInstaller(_id:ID!): [Placement!]!
`;
