import { getModelForClass } from '@typegoose/typegoose';
import TodoList from '../../schemas/TodoList';
import Todo from '../../schemas/Todo';

export default async (todo: Todo, todoListId: TodoList['id']) => {
  try {
    const TodoListModel = getModelForClass(TodoList);
    const { checked, name, type, id } = todo;

    if ((checked === undefined && !name && !type) || !todoListId || !id) {
      return Promise.reject();
    }

    let query;
    if (checked !== undefined) query = { $set: { 'todos.$.checked': checked } };
    if (name) query = { $set: { 'todos.$.name': name } };
    if (type) query = { $set: { 'todos.$.type': type } };

    const updatedModel = await TodoListModel.updateOne(
      { id: todoListId, 'todos.id': id },
      query
    );

    return updatedModel;
  } catch (err) {
    console.dir({ err });
  }
};
