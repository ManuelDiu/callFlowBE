import llamadoController from "./controllers/llamado/llamado";
import usuarioController from "./controllers/usuario/usuario";

interface TestUserInput {
    name: string
}

const controller = {
    Mutation: {
        ...llamadoController?.Mutation,
        ...usuarioController?.Mutation,
    },
    Query: {
        ...llamadoController?.Query,
        ...usuarioController?.Query,
    }
};



export default controller;