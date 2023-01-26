import { prop } from '@typegoose/typegoose';

export default class Todo {
  @prop({ required: true })
  public id!: String;

  @prop({ required: true })
  public checked!: boolean;

  @prop({ required: true })
  public name!: string;

  @prop()
  type?: string;
}
