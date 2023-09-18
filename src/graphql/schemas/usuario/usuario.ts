import { gql } from "apollo-server-express";
import { buildSchema } from "graphql";


const usuarioSchema = gql`
    enum UserRole {
        Admin
        Tribunal
        Cordinador
    }

    enum ITR {
        Suroeste
        Norte
        Este
        Centro Sur
    }

    input LoginCredentials {
        email: String!
        password: String!
    }

    input CrearUsuario {
        email: String!
        password: String!
        name: String!
        lastname: String
        image: String
        biografia: String
        roles: [UserRole]!
        itr: ITR!
        telefono: String
    }

    type UsuarioInfo {
        email: String!
        name: String!
        lastname: String
        image: String
        biografia: String
        roles: [UserRole]!
        itr: ITR!
        telefono: String
    }

    type AuthUserResponse {
        ok: Boolean!
        message: String!
        token: String
    }

    type Mutation {
        createUser(data: CrearUsuario!): AuthUserResponse
        login(data: LoginCredentials!): AuthUserResponse
        checkToken(token: String): UsuarioInfo
    }
`;


export default usuarioSchema;