import { gql } from "apollo-server-express";

const cargoSchema = gql`
    type Cargo {
        id: Int
        nombre: String
        tips: String
    }

    type Query {
        listarCargos: [Cargo]
    }

`;


export default cargoSchema;