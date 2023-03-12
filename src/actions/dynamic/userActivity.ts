import { Request, Response } from 'express';
import TodoList from '../../schemas/TodoList';

const minute = 1 * 60 * 1000;

interface Connection {
  ip: string;
  startTimestamp: number;
}

interface ToDoListConnections {
  todoListId: TodoList['id'];
  connections: Array<Connection>;
}

const currentlyOpenedTodoLists: Array<ToDoListConnections> = [];

startDroppingConnections();

export default async (req: Request, res: Response) => {
  const { params } = req;
  const { todoListId } = params;

  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };
  res.writeHead(200, headers);
  res.write(`data: ${JSON.stringify({})}\n\n`);
};

function startDroppingConnections() {
  setInterval(() => {
    currentlyOpenedTodoLists.forEach(({ connections, todoListId }) => {
      connections.forEach(({ ip, startTimestamp }) => {
        if (Date.now() - startTimestamp < minute * 10) {
          removeConnection(todoListId, ip);
        }
      });
    });
  }, minute);
}

function removeConnection({
  todoListId,
  ip,
}: {
  todoListId: ToDoListConnections['todoListId'];
  ip: Connection['ip'];
}) {
  console.log('removed', todoListId, ip);
}

// function addConnection({
//   todoListId,
//   ip,
// }: {
//   todoListId: ToDoListConnections['todoListId'];
//   ip: Connection['ip'];
// }) {
//   console.log('removed', todoListId, ip);
// }
