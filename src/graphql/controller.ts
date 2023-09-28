import llamadoController from './controllers/llamado/llamado';
import usuarioController from './controllers/usuario/usuario';
import categoriaController from './controllers/categoria/categoria';
import cargoController from './controllers/cargo/cargo';

interface TestUserInput {
  name: string;
}

const controller = {
  Mutation: {
    ...llamadoController?.Mutation,
    ...usuarioController?.Mutation,
    ...categoriaController?.Mutation,
    ...cargoController?.Mutation,
  },
  Query: {
    ...llamadoController?.Query,
    ...usuarioController?.Query,
    ...categoriaController?.Query,
    ...cargoController?.Query,
  },
  Subscription: {
    ...llamadoController?.Subscription,
    ...usuarioController?.Subscription,
    ...categoriaController?.Subscription,
    ...cargoController?.Subscription,
  },
};

export default controller;
