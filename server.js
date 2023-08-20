"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_graphql_1 = require("express-graphql");
const schema_1 = __importDefault(require("./src/schema/schema"));
const controller_1 = __importDefault(require("./src/controllers/controller"));
const dataSource_1 = __importDefault(require("./dataSource"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
// Root resolver
// Create an express server and a GraphQL endpoint
var app = (0, express_1.default)();
dotenv_1.default.config();
app.use((0, cors_1.default)({
    "allowedHeaders": "*",
}));
dataSource_1.default.initialize()
    .then(() => {
    console.log('Connected to database');
})
    .catch((error) => {
    console.log('Error connecting to database:', error);
});
app.use('/graphql', (0, express_graphql_1.graphqlHTTP)({
    schema: schema_1.default,
    rootValue: controller_1.default,
    graphiql: true
}));
app.listen(4000, () => console.log('Express GraphQL Server Now Running On localhost:4000/graphql'));
