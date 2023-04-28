exports.Install = `
type Install {
    id: Int!
    vehicle_id: String
    vehicle: Vehicle!
    placement_id: String
    placement: Placement!
    installer_id: String
    installer: User!
    count: Int!
    installed: Boolean!
    remove: Remove
    campaign_id: String
    campaign: Campaign!
    created_at: String!
    updated_at: String!
}`;

exports.Queries = `

`;

exports.Mutations = `
    installAd(vehicle: String!, placement: String!, count: Int!): Boolean!
`;

// installationUpdate(_id: ID!, count: Int): Installation!
