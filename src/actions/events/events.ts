import { getModelForClass } from '@typegoose/typegoose';
import { Request, Response } from 'express';
import TodoList from '../../schemas/TodoList';

export default async (req: Request, res: Response) => {
  const { params } = req;
  const { todoListId } = params;

  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };
  res.writeHead(200, headers);

  const TodoListModelCollection = getModelForClass(TodoList).collection;
  const pipeline = [{ $match: { 'fullDocument.id': todoListId } }];

  TodoListModelCollection.watch(pipeline, {
    fullDocument: 'updateLookup',
  }).on('change', (data) => {
    // @ts-ignore
    res.write(`data: ${JSON.stringify(data.fullDocument)}\n\n`);
  });
  // close changeStream
  // resume token
};
