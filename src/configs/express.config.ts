import * as bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { print, buildSchema } from 'graphql';

import authenticate from '../middlewares/authenticate.middleware';
import constants from '../constants';
import joiErrorHandler from '../middlewares/joi-error-handler.middleware';
import {
  notFoundErrorHandler,
  errorHandler,
} from '../middlewares/api-error-handler.middleware';
import { graphqlHTTP } from 'express-graphql';
import allSchemas from '../graphql/schema';
import controller from '../graphql/controller';
import expressPlayground from 'graphql-playground-middleware-express';
import IRequest from 'IRequest';
import { ApolloServer } from 'apollo-server-express';

const app = express();

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

app.use(cors(corsOption));

app.use(bodyParser.json());

const server = new ApolloServer({
  typeDefs: allSchemas,
  resolvers: controller,
  context: ({ req} : any) => {
    return {
      miVariable: "",
      headers: req?.headers,
    }
  }
});

async function startApolloServer() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
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

export default app;
