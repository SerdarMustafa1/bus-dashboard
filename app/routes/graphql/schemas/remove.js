exports.Remove = `
type Remove {
    id: Int!
    vehicle_id: String
    vehicle: Vehicle!
    placement_id: String
    placement: Placement!
    campaign_id: String
    campaign: Campaign!
    installer_id: String
    installer: Installer!
    count: Int!
    created_at: String!
    updated_at: String!
}`;

exports.Queries = `
`;

exports.Mutations = `
    removeAd(vehicle: ID!, placement: ID!): Int!
`;
