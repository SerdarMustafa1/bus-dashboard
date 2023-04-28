exports.InstallOrder = `
type InstallOrder {
    campaign_id: String
    campaign: Campaign!
    placement_id: String
    placement: Placement!
    team_id: String
    team: Team
    count: Int!
    installed: Int!
    is_installed: Boolean!
    is_removed: Boolean!
    installs: [Install!]!
    creator: User
    created_at: String!
    updated_at: String!
}`;

exports.Queries = `
`;

exports.Mutations = `
    installOrderCreate(placement: ID!, team: ID!, count: Int!, user: ID): InstallOrder
    installOrderUpdate(placement: ID!, team: ID!, count: Int!, user: ID): InstallOrder
    installOrderRemove(placement: ID!, team: ID!): Boolean
`;

// installationUpdate(_id: ID!, count: Int): Installation!
