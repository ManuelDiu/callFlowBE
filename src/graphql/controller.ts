import llamadoController from "./controllers/llamado/llamado";
import usuarioController from "./controllers/usuario/usuario";
import categoriaController from "./controllers/categoria/categoria";

interface TestUserInput {
    name: string
}

const controller = {
    Mutation: {
        ...llamadoController?.Mutation,
        ...usuarioController?.Mutation,
        ...categoriaController?.Mutation,
    },
    Query: {
        ...llamadoController?.Query,
        ...usuarioController?.Query,
        ...categoriaController?.Query,
    }
};



export default controller;