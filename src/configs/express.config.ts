import * as bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import {
  notFoundErrorHandler,
  errorHandler,
} from '../middlewares/api-error-handler.middleware';
import allSchemas from '../graphql/schema';
import controller from '../graphql/controller';
import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { ApolloServer, gql } from 'apollo-server-express';
import { PubSub } from 'graphql-subscriptions';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { makeExecutableSchema } from '@graphql-tools/schema';

const PORT = process.env.PORT || 5000;

const app = express();
const httpServer = createServer(app);

async function startApolloServer() {
  app.use((req, res, next) => {
    const origin = req.get('origin');

    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(
      'Access-Control-Allow-Methods',
      'GET,POST,HEAD,OPTIONS,PUT,PATCH,DELETE',
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Access-Control-Request-Method, Access-Control-Allow-Headers, Access-Control-Request-Headers',
    );

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
    } else {
      next();
    }
  });

  const corsOption = {
    origin: '*',
    methods: 'GET,POST,HEAD,OPTIONS,PUT,PATCH,DELETE',
    credentials: true,
  };

  app.use(cors(corsOption));

  app.use(bodyParser.json());

  const schema = makeExecutableSchema({
    typeDefs: allSchemas,
    resolvers: controller,
  });

  const server = new ApolloServer({
    schema: schema,
    context: ({ req }: any) => {
      return {
        miVariable: '',
        headers: req?.headers,
      };
    },
  });
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
  SubscriptionServer.create(
    { schema, execute, subscribe },
    { server: httpServer, path: '/graphql' },
  );

  app.use('/graphql', server.getMiddleware());
  console.log('graphql inicializado');

  app.use(morgan('dev'));

  // app.use(authenticate);

  // // Joi Error Handler
  // app.use(joiErrorHandler);

  // Error Handler
  app.use(notFoundErrorHandler);

  app.use(errorHandler);
}

startApolloServer();

export default httpServer;

// const loggingMiddleware = (req: any, res: any, next: any) => {
//   console.log("req:", req)
//   next()
// }

// app.use(loggingMiddleware)

// app.get('/playground', expressPlayground({ endpoint: '/graphql', settings: {
//   "request.credentials": "include",
//   "request.globalHeaders": {
//     "authorization": "Authorization"
//   }
// } }));

// app.use('/graphql', (req, res, next) => {
//   console.log("aca 44", req.headers); // Verifica si los encabezados están presentes
//   next();
// });

// app.use('/graphql', graphqlHTTP({
//   schema: schema,
//   rootValue: controller,
//   graphiql: true,
//   context: ({req}: any) => {
//     return { headers: req?.headers, variable1: "" }
//   }
// }));
