import { getModelForClass } from '@typegoose/typegoose';
import { v4 as uuidv4 } from 'uuid';
import TodoList from '../../schemas/TodoList';

export default async () => {
  try {
    const TodoModel = getModelForClass(TodoList);
    const id = uuidv4();
    const date = new Date();
    const formatDate = date.toLocaleDateString(undefined,  { year: 'numeric', month: 'short', day: 'numeric' })

    const todo = new TodoModel({
      id,
      updatedDate: date,
      todos: [],
      title: `${formatDate} (${id.split('-')[0]})`,
    });
    return await todo.save();
  } catch (err) {
    console.dir({ err });
  }
};
