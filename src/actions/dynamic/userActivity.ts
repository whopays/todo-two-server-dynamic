import { Request, Response } from 'express';
import Todo from '../../schemas/Todo';
import TodoList from '../../schemas/TodoList';

const minute = 1 * 60 * 1000;

interface Connection {
  ip: string; // not unique, do base64
  startTimestamp: number;
}

interface ToDoListConnections {
  todoListId: TodoList['id'];
  todoId: Todo['id'] | undefined;
  connections: Array<Connection>;
}

const currentlyOpenedTodoLists: Array<ToDoListConnections> = [];

startDroppingConnections();

export default async (req: Request, res: Response) => {
  const { params } = req;
  const { todoListId } = params;
  console.log(req.ip);

  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };
  res.writeHead(200, headers);
  res.write(`data: ${JSON.stringify({})}\n\n`);
};

// this streams events, this is where user subscribes
// don't expose IP
function todoListStream() {}

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
}: {
  todoListId: ToDoListConnections['todoListId'];
  ip: Connection['ip'];
}) {
  console.log('added', todoListId, ip);
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
