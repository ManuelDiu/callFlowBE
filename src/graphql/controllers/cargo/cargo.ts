import { Cargo } from 'entities/cargo/cargo.entity';
import { getRepository } from 'typeorm';
import { CargoList } from 'types/cargo';

const cargoController: any = {
  Query: {
    listarCargos: async (): Promise<CargoList[]> => {
      const cargos = await getRepository(Cargo).find();
      const formatCargos = cargos?.map((cargo) => {
        return {
          id: cargo?.id,
          nombre: cargo?.nombre,
          tips: cargo?.tips,
        };
      });

      return formatCargos;
    },
  },
};

export default cargoController;
