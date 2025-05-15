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

  type VerificationResult {
    success: Boolean!
    message: String!
    user: User
  }

  type Query {
    getUsers: [User]
    getUser(id: ID!): User
  }

  type Mutation {
    registerUser(email: String!, phone: String!): User
    verifyCode(email: String!, code: String!): VerificationResult
    login(email: String!): Boolean
    resendCode(email: String!): Boolean
    createVerificationCode(email: String!): Boolean!
  }
`;

module.exports = typeDefs;