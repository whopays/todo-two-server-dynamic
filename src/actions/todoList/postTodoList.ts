import { getModelForClass } from '@typegoose/typegoose';
import { v4 as uuidv4 } from 'uuid';
import TodoList from '../../schemas/TodoList';

export default async () => {
  try {
    const TodoModel = getModelForClass(TodoList);

    const todo = new TodoModel({
      id: uuidv4(),
      updatedDate: new Date(),
      todos: [],
      title: 'title',
    });
    return await todo.save();
  } catch (err) {
    console.dir({ err });
  }
};
