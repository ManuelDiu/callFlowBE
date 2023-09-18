import { buildSchema } from "graphql";
import usuarioSchema from "./schemas/usuario/usuario";
import { mergeTypeDefs } from "@graphql-tools/merge"
import { gql } from "apollo-server-express";

var schema = gql`

    input CreatePersona {
        nombre: String
        email: String
        password: String
    }

    input InputLogin {
        email: String
        password: String
    }


    type Persona {
        id: Int
        nombre: String
        email: String
        password: String
    }

    type PersonaPublic {
        id: Int
        nombre: String
        email: String
    }

    type LoginResponse {
        ok: Boolean
        token: String
    }

    type MessageResponse {
        ok: Boolean
        message: String
    }

    type Query {
        message: MessageResponse,
        testUsuario: MessageResponse
    }

    input CreateUserInput {
        name: String
    }

    type Mutation {
        testUser(name: String!): MessageResponse
        prueba: String
    }
`;

const allSchemas = [usuarioSchema, schema];


export default mergeTypeDefs(allSchemas);