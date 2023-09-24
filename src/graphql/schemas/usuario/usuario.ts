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
        Centro_Sur
    }

    input LoginCredentials {
        email: String!
        password: String!
    }

    input CrearUsuario {
        email: String!
        password: String
        name: String!
        lastname: String
        image: String
        biografia: String
        roles: [UserRole]!
        itr: ITR!
        telefono: String
        documento: String!
    }

    input ResetPasswordInput {
        token: String!
        newPassword: String!
        password: String!
    }

    input ForgetPasswordInput {
        email: String!
    }

    type UsuarioInfo {
        email: String!
        name: String!
        lastName: String
        imageUrl: String
        biografia: String
        roles: [UserRole]!
        itr: ITR!
        telefono: String
    }


    type UserList {
        id: Int
        email: String!
        name: String!
        imageUrl: String
        lastName: String
        roles: [UserRole]!
        itr: ITR!
        telefono: String
        llamados: Int
        activo: Boolean
        documento: String
        biografia: String
    }

    input UpdateUser {
        id: Int
        email: String!
        name: String!
        imageUrl: String
        lastName: String
        roles: [UserRole]!
        itr: ITR!
        telefono: String
        llamados: Int
        activo: Boolean
        documento: String
        biografia: String
    }


    type AuthUserResponse {
        ok: Boolean!
        message: String!
        token: String
    }

    type Message {
        id: ID!
        name: String!
        content: String
    }

    type Mutation {
        createUser(data: CrearUsuario!): AuthUserResponse
        login(data: LoginCredentials!): AuthUserResponse
        checkToken(token: String): UsuarioInfo
        resetPassword(info: ResetPasswordInput!): AuthUserResponse
        forgetPassword(info: ForgetPasswordInput!): AuthUserResponse
        testCreateUser: String
        disabledUser(uid: Int): AuthUserResponse
        updateUser(info: UpdateUser): AuthUserResponse

    }

    type Query {
        listUsuarios: [UserList]
    }


    type Subscription {
        userCreated: UserList
    }

`;


export default usuarioSchema;