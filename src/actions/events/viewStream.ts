import { Request, Response } from 'express';
import Todo from '../../schemas/Todo';
import TodoList from '../../schemas/TodoList';

const minute = 1 * 60 * 1000;

export interface Connection {
  userId: string;
  startTimestamp: number;
  todoId: Todo['id'] | undefined;
  res: Response;
}

export interface ToDoListConnections {
  todoListId: TodoList['id'];
  connections: Array<Connection>;
}

export const currentlyOpenedTodoLists: Array<ToDoListConnections> = [];

startDroppingConnections();

export default async (req: Request, res: Response) => {
  console.log('12312312312a');
  const { todoListId, userId } = req.params;
  console.log('adds stream connection', userId, todoListId);
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };
  res.writeHead(200, headers);

  addConnection({ userId, todoListId, res });
  todoListStream({ res, todoListId, userId });
};

function addConnection({
  todoListId,
  userId,
  res,
}: {
  todoListId: ToDoListConnections['todoListId'];
  userId: Connection['userId'];
  res: Response;
}) {
  const todoListIndex = currentlyOpenedTodoLists.findIndex(
    (currentlyOpenedTodoList) =>
      currentlyOpenedTodoList.todoListId === todoListId
  );

  const newConnection = {
    userId,
    todoId: undefined,
    res,
    startTimestamp: Date.now(),
  };

  if (todoListIndex === -1) {
    currentlyOpenedTodoLists.push({ todoListId, connections: [newConnection] });
  } else {
    currentlyOpenedTodoLists[todoListIndex].connections ??= [];
    currentlyOpenedTodoLists[todoListIndex].connections.push(newConnection);
  }
}

// this streams events, this is where user subscribes
function todoListStream({
  res,
  todoListId,
  userId,
}: {
  res: Response;
  todoListId: ToDoListConnections['todoListId'];
  userId: Connection['userId'];
}) {
  const todoList = currentlyOpenedTodoLists.find(
    (currentlyOpenedTodoList) =>
      currentlyOpenedTodoList.todoListId === todoListId
  );
  console.log(
    todoList?.connections.filter((connection) => connection.userId !== userId)
  );
  const response = todoList?.connections
    .filter((connection) => connection.userId !== userId)
    .map(({ todoId, userId }) => ({
      todoId,
      userId,
    }));
  res.write(`data: ${JSON.stringify(response)}\n\n`);
}

export function changeActiveTodoInConnection({
  todoListId,
  userId,
  todoId,
}: {
  todoListId: ToDoListConnections['todoListId'];
  userId: Connection['userId'];
  todoId: Connection['todoId'];
}) {
  console.log('change todo', todoListId, userId, todoId);
}

// this is not exposed to end used
function startDroppingConnections() {
  setInterval(() => {
    currentlyOpenedTodoLists.forEach(({ connections, todoListId }) => {
      connections.forEach(({ userId, startTimestamp }) => {
        if (Date.now() - startTimestamp < minute * 10) {
          removeConnection({ todoListId, userId });
        }
      });
    });
  }, minute);
}

// this is not exposed to end user
function removeConnection({
  todoListId,
  userId,
}: {
  todoListId: ToDoListConnections['todoListId'];
  userId: Connection['userId'];
}) {
  console.log('removed', todoListId, userId);
}
