import { getModelForClass } from '@typegoose/typegoose';
import { v4 as uuidv4 } from 'uuid';
import TodoList from '../../schemas/TodoList';
import Todo from '../../schemas/Todo';

export default async (name: Todo['name'], todoListId: TodoList['id']) => {
  try {
    const TodoListModel = getModelForClass(TodoList);
    const TodoModel = getModelForClass(Todo);
    const todo = new TodoModel({
      checked: false,
      type: 'new type',
      name: name,
      id: uuidv4(),
    });
    const updatedModel = await TodoListModel.findOneAndUpdate(
      { id: todoListId },
      {
        $push: { todos: todo },
      },
      {
        new: true,
      }
    ).exec();

    return todo;
  } catch (err) {
    console.dir({ err });
  }
};
