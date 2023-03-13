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

function addConnection({
  todoListId,
  ip,
  res,
}: {
  todoListId: ToDoListConnections['todoListId'];
  ip: Connection['ip'];
  res: Response;
}) {
  console.log('added', todoListId, ip, res);
}

function changeActiveTodoInConnection({
  todoListId,
  ip,
}: {
  todoListId: ToDoListConnections['todoListId'];
  ip: Connection['ip'];
}) {
  console.log('change todo');
}
