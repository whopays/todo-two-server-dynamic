import { getModelForClass } from '@typegoose/typegoose';
import TodoList from '../../schemas/TodoList';
import Todo from '../../schemas/Todo';

export default async (todo: Todo, todoListId: TodoList['id']) => {
  try {
    const TodoListModel = getModelForClass(TodoList);
    const { checked, name, type, id } = todo;

    if (
      (checked === undefined && name === undefined && !type) ||
      !todoListId ||
      !id
    ) {
      return Promise.reject();
    }

    let query;
    if (checked !== undefined) query = { $set: { 'todos.$.checked': checked } };
    if (name !== undefined) query = { $set: { 'todos.$.name': name } };
    if (type !== undefined) query = { $set: { 'todos.$.type': type } };
    console.log(query);
    const updatedModel = await TodoListModel.updateOne(
      { id: todoListId, 'todos.id': id },
      query
    );

    return updatedModel;
  } catch (err) {
    console.dir({ err });
  }
};
