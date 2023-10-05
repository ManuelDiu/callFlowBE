import { buildSchema } from "graphql";
import usuarioSchema from "./schemas/usuario/usuario";
import { mergeTypeDefs } from "@graphql-tools/merge"
import { gql } from "apollo-server-express";
import categoriaSchema from "./schemas/categoria/categoria";
import tipoArchivoSchema from "./schemas/tipoArchivo/tipoArchivo";
import llamadoSchema from "./schemas/llamado/llamado";
import cargoSchema from "./schemas/cargo/cargo";
import postulanteSchema from "./schemas/postulante/postulante";
import templateSchema from "./schemas/template/template";
import archivoSchema from "./schemas/archivo/archivo";

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
        getAlgo: String
        testUser(name: String!): MessageResponse
        prueba: String
    }
`;


const allSchemas = [usuarioSchema, categoriaSchema, llamadoSchema, cargoSchema, postulanteSchema, tipoArchivoSchema, templateSchema, archivoSchema, schema];


export default mergeTypeDefs(allSchemas);