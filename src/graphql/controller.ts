import llamadoController from './controllers/llamado/llamado';
import usuarioController from './controllers/usuario/usuario';
import categoriaController from './controllers/categoria/categoria';
import tipoArchivoController from './controllers/tipoArchivo/tipoArchivo';
import cargoController from './controllers/cargo/cargo';
import postulanteController from './controllers/postulante/postulante';
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
    ...postulanteController?.Mutation
  },
  Query: {
    ...llamadoController?.Query,
    ...usuarioController?.Query,
    ...categoriaController?.Query,
    ...tipoArchivoController?.Query,
    ...cargoController?.Query,
    ...postulanteController?.Query
  },
  Subscription: {
    ...llamadoController?.Subscription,
    ...usuarioController?.Subscription,
    ...categoriaController?.Subscription,
    ...categoriaController?.Subscription,
    ...tipoArchivoController?.Subscription,
    ...cargoController?.Subscription,
    ...postulanteController?.Subscription
  },
};

export default controller;
