import mongoose, { Connection } from 'mongoose';

const defaultDatabase = process.env.MONGO_DATABASE;
const protocol = process.env.MONGO_PROTOCOL;
const credentials = `${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}`;
const hostname = process.env.MONGO_HOSTNAME;
const connectionOptions = 'retryWrites=true&w=majority';
const uri = `${protocol}://${credentials}@${hostname}/${defaultDatabase}?${connectionOptions}`;
async function connect() {
  mongoose.set('debug', true);
  mongoose.set('strictQuery', false);

  const connection = await mongoose.connect(uri);

  return await connectionIsUp(connection.connection);
}

async function connectionIsUp(connection: Connection): Promise<boolean> {
  try {
    const adminUtil = connection.db.admin();

    const result = await adminUtil.ping();

    return result?.ok === 1;
  } catch (err) {
    return false;
  }
}

export default connect;
