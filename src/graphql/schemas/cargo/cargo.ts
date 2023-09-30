import { gql } from "apollo-server-express";

const cargoSchema = gql`
  scalar Date

  input CargoItem {
    nombre: String!
    tips: String!
  }

  input UpdateCargoInput {
    id: Int!
    cargo: CargoItem!
  }

  input DeleteCargoInput {
    id: Int!
  }

  type CargoItemOutput {
    nombre: String!
    tips: String!
  }

  type Cargo {
    id: Int
    nombre: String
    tips: String
    updatedAt: Date
  }

  type CargoSubOutput {
    cargo: Cargo!
    operation: String!
  }

  type UpdateCargoResponse {
    ok: Boolean!
    message: String
    cargo: CargoItemOutput
  }

  type MessageResponse {
    ok: Boolean
    message: String
  }

  type Mutation {
    """
    Crear un cargo.
    """
    createCargo(data: CargoItem!): MessageResponse

    """
    Actualizar un cargo.
    """
    updateCargo(data: UpdateCargoInput!): UpdateCargoResponse

    """
    Eliminar un cargo.
    """
    deleteCargo(data: DeleteCargoInput!): MessageResponse
  }

  type Query {
    listarCargos: [Cargo]
  }

  type Subscription {
    cargoCreated: CargoSubOutput
  }
`;

export default cargoSchema;
