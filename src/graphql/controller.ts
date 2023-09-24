import llamadoController from './controllers/llamado/llamado';
import usuarioController from './controllers/usuario/usuario';
import categoriaController from './controllers/categoria/categoria';

interface TestUserInput {
  name: string;
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
  },
  Subscription: {
    ...llamadoController?.Subscription,
    ...usuarioController?.Subscription,
    ...categoriaController?.Subscription,
  },
};

export default controller;
