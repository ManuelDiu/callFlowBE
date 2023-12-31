import llamadoController from './controllers/llamado/llamado';
import usuarioController from './controllers/usuario/usuario';
import categoriaController from './controllers/categoria/categoria';
import tipoArchivoController from './controllers/tipoArchivo/tipoArchivo';
import cargoController from './controllers/cargo/cargo';
import postulanteController from './controllers/postulante/postulante';
import { templateController } from './controllers/template/template';
import archivoController from './controllers/archivo/archivo';
import { disponibilidadController } from './controllers/disponibilidad/disponibilidad';


const controller = {
  Mutation: {
    ...llamadoController?.Mutation,
    ...usuarioController?.Mutation,
    ...categoriaController?.Mutation,
    ...tipoArchivoController?.Mutation,
    ...cargoController?.Mutation,
    ...postulanteController?.Mutation,
    ...templateController?.Mutation,
    ...archivoController?.Mutation,
    ...disponibilidadController?.Mutation,
  },
  Query: {
    ...llamadoController?.Query,
    ...usuarioController?.Query,
    ...categoriaController?.Query,
    ...tipoArchivoController?.Query,
    ...cargoController?.Query,
    ...postulanteController?.Query,
    ...templateController?.Query,
    ...archivoController?.Query,
    ...disponibilidadController?.Query,
  },
  Subscription: {
    ...llamadoController?.Subscription,
    ...usuarioController?.Subscription,
    ...categoriaController?.Subscription,
    ...tipoArchivoController?.Subscription,
    ...cargoController?.Subscription,
    ...postulanteController?.Subscription,
    ...templateController?.Subscription,
    ...archivoController?.Subscription,
    ...disponibilidadController?.Subscription,
  },
};

export default controller;
