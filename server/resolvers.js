const {
  ApolloError,
  AuthenticationError,
  ForbiddenError
} = require('apollo-server-express');

let tasks = [];
let users = [];

module.exports = {
  Query: {
    me: (_, __, { user }) => user,

    tasks: (_, { limit = 10, offset = 0 }, { user }) => {
      if (!user) {
        throw new AuthenticationError('User not authenticated');
      }

      let visibleTasks;

      // Admin sees all
      if (user.role === 'ADMIN') {
        visibleTasks = tasks;
      } else {
        // Normal user sees only own
        visibleTasks = tasks.filter(t => t.userId === user.id);
      }

      // Pagination (unchanged)
      return visibleTasks.slice(offset, offset + limit);
    }
  },

  Mutation: {
    // Login (demo)
    login: (_, { username }) => {
      const role =
        username.toLowerCase() === 'admin' ? 'ADMIN' : 'USER';

      return {
        id: username,
        username,
        role
      };
    },

    // Create task
    createTask: (_, { title }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Login required to create task');
      }

      if (!title || !title.trim()) {
        throw new ApolloError(
          'Task title cannot be empty',
          'INVALID_INPUT'
        );
      }

      const task = {
        id: Date.now().toString(),
        title,
        status: 'OPEN',
        userId: user.id
      };

      tasks.push(task);
      return task;
    },

    // Update task
    updateTaskStatus: (_, { taskId, status }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Login required');
      }

      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        throw new ApolloError(
          'Task not found',
          'NOT_FOUND'
        );
      }

      // Authorization
      if (user.role !== 'ADMIN' && task.userId !== user.id) {
        throw new ForbiddenError(
          'You are not allowed to update this task'
        );
      }

      task.status = status;
      return task;
    }
  }
};
