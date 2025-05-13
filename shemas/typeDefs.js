const { gql } = require('apollo-server');

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    phone: String!
    isVerified: Boolean!
  }

  type AuthCode {
    userId: ID!
    code: String!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    getUsers: [User]
    getUser(id: ID!): User
  }

  type Mutation {
    registerUser(email: String!, phone: String!, via: String!): Boolean
    verifyCode(email: String!, code: String!): AuthPayload
    login(email: String!): Boolean
  }
`;

module.exports = typeDefs;