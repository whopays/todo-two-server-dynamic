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
    const pulledTodoList = await TodoListModel.findOneAndUpdate(
      { id: todoListId },
      {
        $pull: { todos: { id: todoId } },
      }
    ).exec();
    const pulledTodo = pulledTodoList?.todos?.find(({ id }) => id === todoId);
    const updatedModel = await TodoListModel.findOneAndUpdate(
      { id: todoListId },
      {
        $push: {
          todos: { $each: [pulledTodo], $position: position },
        },
      },
      { new: true }
    ).exec();

    return updatedModel;
  } catch (err) {
    console.dir({ err });
  }
};
