// replacing entire array as it's impossible as of now to $pull and $push atomically, leading to update event being sent 2 times, in turn leading to flickering
import { getModelForClass } from '@typegoose/typegoose';
import Todo from '../../schemas/Todo';
import TodoList from '../../schemas/TodoList';

function moveArrayItem(
  array: Array<Todo>,
  todoId: Todo['id'],
  toIndex: number
): Array<any> {
  const newArray = [...array];
  const oldPosition = array.findIndex(({ id }) => id === todoId);
  const item = newArray[oldPosition];
  newArray.splice(oldPosition, 1);
  newArray.splice(toIndex, 0, item);
  return newArray;
}

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
    const todoList = await TodoListModel.findOne(
      {
        id: todoListId,
      },
      { todos: 1, _id: 0 }
    );

    const updatedModel = await TodoListModel.findOneAndUpdate(
      { id: todoListId },
      {
        $set: {
          todos: moveArrayItem(todoList?.todos || [], todoId, position),
        },
      },
      { new: true }
    );

    return updatedModel;
  } catch (err) {
    console.dir({ err });
  }
};
