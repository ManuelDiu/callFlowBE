import llamadoController from './controllers/llamado/llamado';
import usuarioController from './controllers/usuario/usuario';
import categoriaController from './controllers/categoria/categoria';
import tipoArchivoController from './controllers/tipoArchivo/tipoArchivo';
import cargoController from './controllers/cargo/cargo';
import { templateController } from './controllers/template/template';
import archivoController from './controllers/archivo/archivo';

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
    ...templateController?.Mutation,
    ...archivoController?.Mutation,
  },
  Query: {
    ...llamadoController?.Query,
    ...usuarioController?.Query,
    ...categoriaController?.Query,
    ...tipoArchivoController?.Query,
    ...cargoController?.Query,
    ...templateController?.Query,
    ...archivoController?.Query,
  },
  Subscription: {
    ...llamadoController?.Subscription,
    ...usuarioController?.Subscription,
    ...categoriaController?.Subscription,
    ...tipoArchivoController?.Subscription,
    ...cargoController?.Subscription,
    ...templateController?.Subscription,
    ...archivoController?.Subscription,
  },
};

export default controller;
