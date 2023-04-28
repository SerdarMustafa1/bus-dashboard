exports.Campaign = `
type Campaign {
    _id: ID!
    name: String!
    client_id: String
    client: Client!
    creator_id: String
    creator: User!
    budget: Float!
    priority: Boolean!
    cities: [City!]!
    placements: [Placement!]!
    pictures: [Picture!]!
    installs: [Install!]!
    removes: [Remove!]!
    startDate: String!
    endDate: String!
    isActive: Boolean!
    created_at: String!
    updated_at: String!
}

input PrePlacement {
    place: ID!
    count: Int!
}`;

exports.Queries = `
    campaign(_id:ID): Campaign
    campaignVehiclesForInstallers(_id:ID!, search:String, skip:Int): [Vehicle!]!
    campaignPictures(_id: ID!): [Picture!]!
    campaignVehicles(_id: ID!): [Vehicle!]!
    campaignLogin(_id: ID!, password: String!): String
    
    campaigns(skip:Int, limit:Int, search: String): [Campaign!]!
    campaignsTil(date:String): [Campaign!]!
    campaignsActive: [Campaign!]!
    campaignsForInstallers(search:String, skip:Int): [Campaign!]!
`;

exports.Mutations = `
    campaignCreate(name: String!, client: ID!, budget: Float!, priority: Boolean!, cities: [ID!]!, startDate: String!, endDate: String!, places: [PrePlacement!]!): Campaign
    campaignUpdate(_id: ID!, name: String!, client: ID!, budget: Float!, priority: Boolean!, cities: [ID!]!, startDate: String!, endDate: String!, places: [PrePlacement!]!): Campaign
    campaignShare(_id: ID!, email: String!): Boolean
    
    campaignHardDelete(_id: ID!): Boolean!
`;
