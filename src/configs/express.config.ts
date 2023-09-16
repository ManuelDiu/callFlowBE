import * as bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authenticate from '../middlewares/authenticate.middleware';
import constants from '../constants';
import joiErrorHandler from '../middlewares/joi-error-handler.middleware';
import { notFoundErrorHandler, errorHandler } from '../middlewares/api-error-handler.middleware';
import { graphqlHTTP } from "express-graphql";
import schema from '../graphql/schema';
import controller from '../graphql/controller';

const app = express();

app.use((req, res, next) => {
  const origin = req.get('origin');

  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,HEAD,OPTIONS,PUT,PATCH,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Access-Control-Request-Method, Access-Control-Allow-Headers, Access-Control-Request-Headers');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
  } else {
    next();
  }
});

const corsOption = {
  origin: "*",
  methods: 'GET,POST,HEAD,OPTIONS,PUT,PATCH,DELETE',
  credentials: true,
}

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: controller,
  graphiql: true
}));


app.use(cors(corsOption));

app.use(bodyParser.json());

app.use(morgan('dev'));

app.use(authenticate);

// Joi Error Handler
app.use(joiErrorHandler);

// Error Handler
app.use(notFoundErrorHandler);
app.use(errorHandler);

export default app;