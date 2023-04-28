exports.User = `
type User {
    _id: ID!
    name: String!
    email: String!
    phone: String
    role: Int!
    city_id: String
    city: City
    installs: [Install!]!
    Removes: [Remove!]!
    campaigns: [Campaign!]!
    isDeleted: Boolean
    created_at: String!
    updated_at: String!
}`;

exports.Queries = `
    user(_id:ID): User
    login(email: String!, password: String!): String
    passwordRecovery(email: String!): Boolean!
    recoveryValidate(token: String!): String
    tokenValidate: String
`;

exports.Mutations = `
    userCreate(name: String!, email: String!, role: Int!, phone: String, city:ID): User
    userUpdate(_id: ID!, name: String, email: String, role: Int, phone: String, city: ID): User
    userCredentials(_id: ID!, email: String, password: String): User
    userDelete(_id: ID!): User
    userMailing(_id:ID!, mail:String!, value: Boolean!): Boolean!
    resetPassword(token: String!, password: String!): Boolean!
    
    userSetSuperUser(_id: ID!): User
    userHardDelete(_id: ID!): Boolean!
`;
