import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { useServer } from 'graphql-ws/lib/use/ws';
import rateLimit from 'express-rate-limit';

import bodyParser from 'body-parser';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { WebSocketServer } from 'ws';

import connection from './config/mongoConnect';
import typeDefs from './schemas/typeDefs';
import resolvers from './schemas/resolvers';
import selfPing from './selfPing';
import changeEventsStream from './actions/events/changeEventsStream';
import viewStream from './actions/events/viewStream';
import postEvent from './actions/events/postEvent';

const app = express();
const httpServer = createServer(app);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

const schema = makeExecutableSchema({ typeDefs, resolvers });
const plugins = [
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
];

if (process.env.NODE_ENV === 'production') {
  plugins.push(ApolloServerPluginLandingPageDisabled());
}

const server = new ApolloServer({
  schema,
  // typeDefs,
  // resolvers,
  plugins,
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

  app.use('/events/:todoListId', cors<cors.CorsRequest>(), changeEventsStream);
  app.use(
    '/viewStream/:todoListId/:userId',
    cors<cors.CorsRequest>(),
    viewStream
  );
  app.use(
    '/postEvent',
    cors<cors.CorsRequest>({
      methods: ['POST', 'OPTIONS'],
      credentials: false,
    }),
    bodyParser.json({ limit: '1mb' }),
    postEvent
  );
  app.use('/health', (req, res) => {
    res.status(200).send({
      uptime: process.uptime(),
      time: new Date(),
    });
  });

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
