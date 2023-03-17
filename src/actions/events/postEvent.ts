import { Request, Response } from 'express';
import { changeActiveTodoInConnection } from './viewStream';

export default async (req: Request, res: Response) => {
  const { todoListId, todoId, userId } = req.body;
  changeActiveTodoInConnection({ todoListId, userId, todoId });
  res.sendStatus(200);
};
