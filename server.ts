import express from "express";
import { graphqlHTTP } from "express-graphql";
import schema from "./src/schema/schema"
import controller from "./src/controllers/controller"
import myDataSource from "./dataSource";
import dotenv from "dotenv";
import cors from "cors"

// Root resolver
// Create an express server and a GraphQL endpoint
var app = express();
dotenv.config();
app.use(cors({
  "allowedHeaders": "*",
}))

myDataSource.initialize()
  .then(() => {
    console.log('Connected to database');
  })
  .catch((error) => {
    console.log('Error connecting to database:', error);
  });


app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: controller,
    graphiql: true
}));
app.listen(4000, () => console.log('Express GraphQL Server Now Running On localhost:4000/graphql'));