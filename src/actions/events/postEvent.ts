import { Request, Response } from 'express';
import { changeActiveTodoInConnection } from './viewStream';

export default async (req: Request, res: Response) => {
  const { ip } = req;
  const { todoListId, todoId } = req.body;
  changeActiveTodoInConnection({ todoListId, ip, todoId });
  res.sendStatus(200);
};
