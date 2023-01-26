import postTodo from '../actions/todo/postTodo';
import deleteTodo from '../actions/todo/deleteTodo';
import putTodo from '../actions/todo/putTodo';
import getTodoList from '../actions/todoList/getTodoList';
import postTodoList from '../actions/todoList/postTodoList';
import deleteTodoList from '../actions/todoList/deleteTodoList';
import Todo from './Todo';
import TodoList from './TodoList';

const resolvers = {
  Query: {
    todoList: async (parent: unknown, { id }: { id: TodoList['id'] }) => {
      return await getTodoList(id);
    },
  },
  Mutation: {
    postTodoList: async () => {
      return await postTodoList();
    },
    deleteTodoList: async (
      parent: unknown,
      { todoListId }: { todoListId: TodoList['id'] }
    ) => {
      return await deleteTodoList(todoListId);
    },
    postTodo: async (
      parent: unknown,
      { todo, todoListId }: { todo: Todo; todoListId: TodoList['id'] }
    ) => {
      return await postTodo(todo, todoListId);
    },
    putTodo: async (
      parent: unknown,
      { todoListId, name }: { todoListId: Todo['id']; name: Todo['name'] }
    ) => {
      return await putTodo(name, todoListId);
    },
    deleteTodo: async (
      parent: unknown,
      { todoListId, todoId }: { todoListId: TodoList['id']; todoId: Todo['id'] }
    ) => {
      await deleteTodo(todoListId, todoId);
      return todoId;
    },
  },
};

export default resolvers;
