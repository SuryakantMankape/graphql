const { gql } = require('apollo-server-express');

module.exports = gql`
  enum TaskStatus {
    OPEN
    DONE
  }

  type User {
    id: ID!
    username: String!
    role: String!
  }

  type Task {
    id: ID!
    title: String!
    status: TaskStatus!
    userId: ID!
  }

type Query {
    tasks(limit: Int, offset: Int): [Task!]!
    me: User
  }

  type Mutation {
    login(username: String!): User
    createTask(title: String!): Task
    updateTaskStatus(taskId: ID!, status: TaskStatus!): Task
  }
`;
