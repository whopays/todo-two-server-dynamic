import { prop, ReturnModelType } from '@typegoose/typegoose';
import Todo from './Todo';

export default class TodoList {
  @prop({ required: true })
  public id!: String;

  @prop({ required: true })
  public updatedDate!: Date;

  @prop({ required: true, type: () => Todo })
  public todos!: Todo[];

  @prop()
  title?: string;

  public static async findOneById(
    this: ReturnModelType<typeof TodoList>,
    id: TodoList['id']
  ) {
    return this.findOne({ id }).exec();
  }
}
