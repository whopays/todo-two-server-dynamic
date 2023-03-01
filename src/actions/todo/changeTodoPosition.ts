import { getModelForClass } from '@typegoose/typegoose';
import Todo from '../../schemas/Todo';
import TodoList from '../../schemas/TodoList';

export default async ({
  todoListId,
  todoId,
  position,
}: {
  todoListId: TodoList['id'];
  todoId: Todo['id'];
  position: number;
}) => {
  try {
    const TodoListModel = getModelForClass(TodoList);
    const pulledTodo = await TodoListModel.findOneAndUpdate(
      { id: todoListId },
      {
        $pull: { todos: { id: todoId } },
      }
    ).exec();

    const updatedModel = await TodoListModel.findOneAndUpdate(
      { id: todoListId },
      {
        $push: {
          todos: { $each: [pulledTodo], $position: position },
        },
      }
    ).exec();
    return updatedModel;
  } catch (err) {
    console.dir({ err });
  }
};
