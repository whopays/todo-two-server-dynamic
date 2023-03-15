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
  const updatePipeline = [{ $match: { 'fullDocument.id': todoListId } }];
  const deletePipeline = [
    {
      $match: {
        operationType: 'delete',
        'fullDocumentBeforeChange.id': todoListId,
      },
    },
  ];

  TodoListModelCollection.watch(updatePipeline, {
    fullDocument: 'updateLookup',
  }).on('change', (data) => {
    // @ts-ignore
    res.write(`data: ${JSON.stringify(data.fullDocument)}\n\n`);
  });

  // is sended 3 times
  getModelForClass(TodoList)
    .watch(deletePipeline, {
      fullDocumentBeforeChange: 'whenAvailable',
    })
    .on('change', (data) => {
      res.write(
        `data: ${JSON.stringify({
          // @ts-ignore
          ...data.fullDocumentBeforeChange,
          deleted: true,
        })}\n\n`
      );
    });

  // close changeStream
  // resume token
};