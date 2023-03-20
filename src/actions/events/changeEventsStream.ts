import { getModelForClass } from '@typegoose/typegoose';
import {
  ChangeStreamUpdateDocument,
  ChangeStreamDeleteDocument,
} from 'mongodb';
import { Request, Response } from 'express';
import TodoList from '../../schemas/TodoList';

export default async (req: Request, res: Response) => {
  const { todoListId } = req.params;
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };
  res.writeHead(200, headers);

  const TodoListModel = getModelForClass(TodoList);
  const TodoListModelCollection = TodoListModel.collection;
  const updatePipeline = [{ $match: { 'fullDocument.id': todoListId } }];
  const deletePipeline = [
    {
      $match: {
        operationType: 'delete',
        'fullDocumentBeforeChange.id': todoListId,
      },
    },
  ];

  const updateCursor = TodoListModelCollection.watch(updatePipeline, {
    fullDocument: 'updateLookup',
  }).on('change', (data: ChangeStreamUpdateDocument) => {
    res.write(`data: ${JSON.stringify(data.fullDocument)}\n\n`);
  });

  // is sended 3 times
  const deleteCursor = TodoListModel.watch(deletePipeline, {
    fullDocumentBeforeChange: 'whenAvailable',
  }).on('change', (data: ChangeStreamDeleteDocument) => {
    res.write(
      `data: ${JSON.stringify({
        ...data.fullDocumentBeforeChange,
        deleted: true,
      })}\n\n`
    );
  });

  if (res.socket) {
    res.socket.on('close', () => {
      deleteCursor.close();
      updateCursor.close();
      res.end();
    });
  }
};
