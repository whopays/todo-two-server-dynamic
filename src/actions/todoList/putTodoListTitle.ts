import { getModelForClass } from '@typegoose/typegoose';
import TodoList from '../../schemas/TodoList';

export default async (title: TodoList['title'], todoListId: TodoList['id']) => {
  try {
    const TodoListModel = getModelForClass(TodoList);
    const updatedModel = await TodoListModel.findOneAndUpdate(
      { id: todoListId },
      {
        $set: { title },
      },
      {
        new: true,
      }
    ).exec();

    return title;
  } catch (err) {
    console.dir({ err });
  }
};
