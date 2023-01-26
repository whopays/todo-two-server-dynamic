import { getModelForClass } from '@typegoose/typegoose';
import TodoList from '../../schemas/TodoList';

export default async (id: TodoList['id']) => {
  try {
    const TodoListModel = getModelForClass(TodoList);
    const data = await TodoListModel.findOneById(id);

    return data;
  } catch (err) {
    console.dir({ err });
  }
};
