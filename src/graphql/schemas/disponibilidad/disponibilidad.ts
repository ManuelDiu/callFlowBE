import { gql } from "apollo-server-express";


export const disponibilidadSchema = gql`

  input DisponibilidadCreate {
    horaMin: String!
    horaMax: String!
    fecha: String!
    llamadoId: Int!
  }

  type DisponibilidadList {
    horaMin: String
    horaMax: String
    fecha: String
    id: Int
    llamadoId: Int
  }


  type Query {
    listarDisponibilidad(llamadoId: Int!): [DisponibilidadList]
  }

  type Mutation {
    crearDisponibilidad(data: DisponibilidadCreate): MessageResponse
    borrarDisponibilidad(disponibilidadId: Int!): MessageResponse

  }
`

export default disponibilidadSchema;