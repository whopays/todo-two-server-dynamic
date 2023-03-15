import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { useServer } from 'graphql-ws/lib/use/ws';

import bodyParser from 'body-parser';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { WebSocketServer } from 'ws';

import connection from './config/mongoConnect';
import typeDefs from './schemas/typeDefs';
import resolvers from './schemas/resolvers';
import selfPing from './selfPing';
import events from './actions/events/changeEventsStream';
import activityStream from './actions/events/viewStream';
import changeEventsStream from './actions/events/changeEventsStream';
import viewStream from './actions/events/viewStream';
import postViewEvent from './actions/events/postViewEvent';

const app = express();
const httpServer = createServer(app);

const schema = makeExecutableSchema({ typeDefs, resolvers });
const server = new ApolloServer({
  schema,
  // typeDefs,
  // resolvers,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

// Creating the WebSocket server
const wsServer = new WebSocketServer({
  // This is the `httpServer` we created in a previous step.
  server: httpServer,
  // Pass a different path here if app.use
  // serves expressMiddleware at a different path
  // path: '/graphql',
});

// Hand in the schema we just created and have the
// WebSocketServer start listening.
const serverCleanup = useServer({ schema }, wsServer);

let port: string | undefined = process.env.PORT;
let parsedPort: number = 4000;

if (typeof port === 'string') {
  parsedPort = parseInt(port, 10);
}

(async () => {
  const isUp = await connection();
  console.log(isUp ? 'Connected successfully to DB' : "Can't connect to DB");

  await server.start();

  app.use(
    '/events/:todoListId',
    cors<cors.CorsRequest>(),
    bodyParser.json({ limit: '1mb' }),
    changeEventsStream
  );

  app.use(
    '/viewStream/:todoListId/',
    cors<cors.CorsRequest>(),
    bodyParser.json({ limit: '1mb' }),
    viewStream
  );

  app.use(
    '/viewEvent/:todoListId',
    cors<cors.CorsRequest>(),
    bodyParser.json({ limit: '1mb' }),
    postViewEvent
  );

  app.use(
    '/',
    cors<cors.CorsRequest>({
      methods: ['GET', 'POST', 'OPTIONS'],
      credentials: false,
    }),
    bodyParser.json({ limit: '1mb' }),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        return {};
      },
    })
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: parsedPort }, resolve)
  );
  console.log(`🚀 Server ready at port ${parsedPort}`);
})();

selfPing();
