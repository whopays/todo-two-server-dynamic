import { getModelForClass } from '@typegoose/typegoose';
import TodoList from '../../schemas/TodoList';

export default async (todoListId: TodoList['id']) => {
  try {
    const TodoListModel = getModelForClass(TodoList);
    const updatedModel = await TodoListModel.findOneAndDelete({
      id: todoListId,
    }).exec();

    return updatedModel?.id;
  } catch (err) {
    console.dir({ err });
  }
};
