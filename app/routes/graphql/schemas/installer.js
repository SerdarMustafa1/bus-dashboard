exports.Installer = `
type Installer {
    _id: ID!
    user_id: String
    user: User!
    team_id: String
    team: Team!
    isActive: Boolean!
    created_at: String!
    updated_at: String!
    installs: [Install!]!
    removes: [Remove!]!
}`;

exports.Queries = `
    installerMe: Installer
    installer(_id:ID): Installer
    installers: [Installer!]!
    installersValid: [User!]!
`;

exports.Mutations = `
    installerCreate(team: ID!, user: ID!): Installer
    installerRemove(_id: ID!): Boolean
`;

// installationUpdate(_id: ID!, count: Int): Installation!
