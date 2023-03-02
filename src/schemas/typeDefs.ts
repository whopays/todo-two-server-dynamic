import gql from 'graphql-tag';

const typeDefs = gql`
  type Todo {
    id: String
    checked: Boolean
    name: String
  }

  input TodoInput {
    id: String
    checked: Boolean
    name: String
  }

  type TodoList {
    id: String
    title: String
    todos: [Todo]
  }

  type Query {
    todoList(id: String!): TodoList
  }

  type Mutation {
    deleteTodoList(todoListId: String!): String
    postTodoList: TodoList
    putTodoListTitle(title: String!, todoListId: String!): String
    changeTodoPosition(
      todoId: String!
      todoListId: String!
      position: Int!
    ): TodoList

    putTodo(name: String!, todoListId: String!): Todo
    postTodo(todo: TodoInput!, todoListId: String!): Todo
    deleteTodo(todoListId: String!, todoId: String!): String
  }

  type Subscription {
    todoAdded(todoListId: String!): Todo
    todoEdited(todoListId: String!): Todo
    todoRemoved(todoListId: String!): String
  }
`;

export default typeDefs;
