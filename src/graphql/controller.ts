import llamadoController from './controllers/llamado/llamado';
import usuarioController from './controllers/usuario/usuario';
import categoriaController from './controllers/categoria/categoria';
import tipoArchivoController from './controllers/tipoArchivo/tipoArchivo';
import cargoController from './controllers/cargo/cargo';

interface TestUserInput {
  name: string;
}

const controller = {
  Mutation: {
    ...llamadoController?.Mutation,
    ...usuarioController?.Mutation,
    ...categoriaController?.Mutation,
    ...tipoArchivoController?.Mutation,
    ...cargoController?.Mutation,
  },
  Query: {
    ...llamadoController?.Query,
    ...usuarioController?.Query,
    ...categoriaController?.Query,
    ...tipoArchivoController?.Query,
    ...cargoController?.Query,
  },
  Subscription: {
    ...llamadoController?.Subscription,
    ...usuarioController?.Subscription,
    ...categoriaController?.Subscription,
    ...categoriaController?.Subscription,
    ...tipoArchivoController?.Subscription,
    ...cargoController?.Subscription,
  },
};

export default controller;
