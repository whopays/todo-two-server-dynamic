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

export let currentlyOpenedTodoLists: Array<ToDoListConnections> = [];

startDroppingConnections();

export default async (req: Request, res: Response) => {
  const { todoListId, userId } = req.params;
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };
  res.writeHead(200, headers);

  addConnection({ userId, todoListId, res });
  todoListSubmitToAll({ todoListId, userId });
  if (res.socket) {
    res.socket.on('close', () => {
      removeConnection({ todoListId, userId });
      res.end();
    });
  }
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

function removeConnection({
  todoListId,
  userId,
}: {
  todoListId: ToDoListConnections['todoListId'];
  userId: Connection['userId'];
}) {
  const todoList = currentlyOpenedTodoLists.find(
    (currentlyOpenedTodoList) =>
      currentlyOpenedTodoList.todoListId === todoListId
  );

  if (!todoList) return;

  todoList.connections = todoList.connections.filter(
    (connection) => connection.userId !== userId
  );
}

// this streams events, this is where user subscribes
function todoListSubmitToAll({
  todoListId,
  userId,
}: {
  todoListId: ToDoListConnections['todoListId'];
  userId: Connection['userId'];
}) {
  const todoList = currentlyOpenedTodoLists.find(
    (currentlyOpenedTodoList) =>
      currentlyOpenedTodoList.todoListId === todoListId
  );
  const response = todoList?.connections.map(({ todoId, userId }) => ({
    todoId,
    userId,
  }));

  todoList?.connections
    .filter((connection) => connection.userId !== userId)
    .forEach((connection) => {
      connection.res.write(`data: ${JSON.stringify(response)}\n\n`);
    });
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
  const todoList = currentlyOpenedTodoLists.find(
    (currentlyOpenedTodoList) =>
      currentlyOpenedTodoList.todoListId === todoListId
  );

  const connection = todoList?.connections.find(
    (connection) => connection.userId === userId
  );
  if (connection) {
    connection.todoId = todoId;
  }

  todoList?.connections.forEach((connection) => {
    todoListSubmitToAll({ todoListId, userId });
  });
}

// this is not exposed to end used
function startDroppingConnections() {
  setInterval(() => {
    currentlyOpenedTodoLists.forEach((currentlyOpenedTodoList) => {
      currentlyOpenedTodoList.connections =
        currentlyOpenedTodoList.connections.filter(({ startTimestamp }) => {
          return Date.now() - startTimestamp < minute * 4;
        });
      if (currentlyOpenedTodoList.connections.length === 0) {
        currentlyOpenedTodoLists = currentlyOpenedTodoLists.filter(
          (list) => currentlyOpenedTodoList.todoListId !== list.todoListId
        );
      }
    });
  }, minute);
}
