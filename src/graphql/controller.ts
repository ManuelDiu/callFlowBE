import llamadoController from "./controllers/llamado/llamado";
import usuarioController from "./controllers/usuario/usuario";

interface TestUserInput {
    name: string
}

const controller = { 
    ...llamadoController,
    ...usuarioController,
   
};



export default controller;