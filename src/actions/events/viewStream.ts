import { Request, Response } from 'express';
import Todo from '../../schemas/Todo';
import TodoList from '../../schemas/TodoList';

const minute = 1 * 60 * 1000;

interface Connection {
  ip: string; // not unique, do base64 split
  startTimestamp: number;
  todoId: Todo['id'] | undefined;
  res: Response;
}

interface ToDoListConnections {
  todoListId: TodoList['id'];
  connections: Array<Connection>;
}

const currentlyOpenedTodoLists: Array<ToDoListConnections> = [];

startDroppingConnections();

export default async (req: Request, res: Response) => {
  const { params, ip } = req;
  const { todoListId } = params;
  console.log(ip);

  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };
  res.writeHead(200, headers);
  addConnection({ ip, todoListId, res });
  todoListStream({ res, todoListId });
};

function addConnection({
  todoListId,
  ip,
  res,
}: {
  todoListId: ToDoListConnections['todoListId'];
  ip: Connection['ip'];
  res: Response;
}) {
  const todoListIndex = currentlyOpenedTodoLists.findIndex(
    (currentlyOpenedTodoList) =>
      currentlyOpenedTodoList.todoListId === todoListId
  );

  const newConnection = {
    ip,
    todoId: undefined,
    res,
    startTimestamp: Date.now(),
  };

  if (todoListIndex === -1) {
    currentlyOpenedTodoLists.push({ todoListId, connections: [newConnection] });
  } else {
    currentlyOpenedTodoLists[todoListIndex].connections ??= [];
    currentlyOpenedTodoLists[todoListIndex].connections.push();
  }
  console.log(currentlyOpenedTodoLists);
}

// this streams events, this is where user subscribes
// don't expose IP
function todoListStream({
  res,
  todoListId,
}: {
  res: Response;
  todoListId: ToDoListConnections['todoListId'];
}) {
  currentlyOpenedTodoLists.find(
    (currentlyOpenedTodoList) =>
      currentlyOpenedTodoList.todoListId === todoListId
  );
  res.write(`data: ${JSON.stringify({})}\n\n`);
}

function changeActiveTodoInConnection({
  todoListId,
  ip,
  todoId,
}: {
  todoListId: ToDoListConnections['todoListId'];
  ip: Connection['ip'];
  todoId: Connection['todoId'];
}) {
  console.log('change todo');
}

// this is not exposed to end used
function startDroppingConnections() {
  setInterval(() => {
    currentlyOpenedTodoLists.forEach(({ connections, todoListId }) => {
      connections.forEach(({ ip, startTimestamp }) => {
        if (Date.now() - startTimestamp < minute * 10) {
          removeConnection({ todoListId, ip });
        }
      });
    });
  }, minute);
}

// this is not exposed to end user
function removeConnection({
  todoListId,
  ip,
}: {
  todoListId: ToDoListConnections['todoListId'];
  ip: Connection['ip'];
}) {
  console.log('removed', todoListId, ip);
}
