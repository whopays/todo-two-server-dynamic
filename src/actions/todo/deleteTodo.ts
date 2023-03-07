import { getModelForClass } from '@typegoose/typegoose';
import Todo from '../../schemas/Todo';
import TodoList from '../../schemas/TodoList';

export default async (todoListId: TodoList['id'], todoId: Todo['id']) => {
  try {
    const TodoListModel = getModelForClass(TodoList);
    const updatedModel = await TodoListModel.findOneAndUpdate(
      { id: todoListId },
      {
        $pull: { todos: { id: todoId } },
      },
      { new: true }
    ).exec();

    return updatedModel;
  } catch (err) {
    console.dir({ err });
  }
};
