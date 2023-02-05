import { getModelForClass } from '@typegoose/typegoose';
import { v4 as uuidv4 } from 'uuid';
import TodoList from '../../schemas/TodoList';

export default async () => {
  try {
    const TodoModel = getModelForClass(TodoList);
    const id = uuidv4();

    const todo = new TodoModel({
      id,
      updatedDate: new Date(),
      todos: [],
      title: id.split('-')[0],
    });
    return await todo.save();
  } catch (err) {
    console.dir({ err });
  }
};
