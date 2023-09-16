import { buildSchema } from "graphql";

var schema = buildSchema(`

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
        message: MessageResponse
    }
    
    input CreateUserInput {
        name: String
    }

    type Mutation {
        testUser(name: String!): MessageResponse
    }
`);

export default schema;