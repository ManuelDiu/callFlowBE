import { Cargo } from "entities/cargo/cargo.entity";
import { getRepository } from "typeorm";
import { MessageResponse } from "types/response";
import {
  CargoList,
  CargoType,
  DeleteCargoInput,
  UpdateCargoInput,
  UpdateCargoResponse,
} from "types/cargo";
import { Roles as EnumRoles } from "enums/Roles";
import { PubSub } from "graphql-subscriptions";
import { checkAuth } from "utilities/checkAuth";

const pubsub = new PubSub();

const cargoController: any = {
  Mutation: {
    createCargo: async (
      _: any,
      {
        data,
      }: {
        data: CargoType;
      },
      context: any
    ): Promise<MessageResponse> => {
      try {
        await checkAuth(context, [EnumRoles.admin]);
        // check if cargo already exists by its name
        const foundCargo = await getRepository(Cargo).findOne({
          nombre: data.nombre,
        });
        if (foundCargo) {
          throw new Error(`El cargo '${data.nombre}' ya existe.`);
        }

        const newCargo = new Cargo();
        newCargo.nombre = data.nombre;
        newCargo.tips = data.tips;

        const cargoCreation = await getRepository(Cargo).save(
          newCargo
        );
        if (cargoCreation.id) {
          pubsub.publish("List_Cargos", {
            cargoCreated: {
              cargo: {
                id: cargoCreation.id,
                nombre: cargoCreation.nombre,
                tips: cargoCreation.tips,
                updatedAt: cargoCreation.updatedAt,
              } as CargoList,
              operation: "CREATE",
            },
          });
          return {
            ok: true,
            message: "Cargo creado correctamente.",
          };
        } else {
          throw new Error("Error al crear el cargo.");
        }
      } catch (e) {
        console.log("CreateCargo Error", e);
        return {
          ok: false,
          message: e?.message,
        };
      }
    },
    updateCargo: async (
      _: any,
      {
        data,
      }: {
        data: UpdateCargoInput;
      },
      context: any
    ): Promise<UpdateCargoResponse> => {
      try {
        await checkAuth(context, [EnumRoles.admin]);
        const foundCargo = await getRepository(Cargo).findOne(data.id);

        if (!foundCargo) {
          throw new Error("Cargo no encontrado.");
        }

        foundCargo.nombre = data.cargo.nombre;
        foundCargo.tips = data.cargo.tips;

        await getRepository(Cargo).save(foundCargo);
        pubsub.publish("List_Cargos", {
          cargoCreated: {
            cargo: {
              id: foundCargo.id,
              nombre: foundCargo.nombre,
              tips: foundCargo.tips,
              updatedAt: foundCargo.updatedAt,
            } as CargoList,
            operation: "UPDATE",
          },
        });
        return {
          ok: true,
          message: "Cargo modificado correctamente.",
          cargo: foundCargo,
        };
      } catch (e) {
        console.log("UpdateCargo Error", e);
        return {
          ok: false,
          message: e?.message,
        };
      }
    },
    deleteCargo: async (
      _: any,
      {
        data,
      }: {
        data: DeleteCargoInput;
      },
      context: any
    ): Promise<MessageResponse> => {
      try {
        await checkAuth(context, [EnumRoles.admin]);
        const foundCargo = await getRepository(Cargo).findOne(data.id);

        if (!foundCargo) {
          throw new Error("Cargo a eliminar no encontrado.");
        }

        const foundRelation = await getRepository(Cargo)
          .createQueryBuilder("foundCargo")
          .innerJoin("foundCargo.templates", "template")
          .where("foundCargo.id = :tempId", { tempId: foundCargo.id })
          .getOne();

        if (foundRelation) {
          throw new Error(
            "No puedes eliminar un cargo que tenga asociado al menos un template."
          );
        }

        await getRepository(Cargo).delete(data.id);
        pubsub.publish("List_Cargos", {
          cargoCreated: {
            cargo: {
              id: foundCargo.id,
              nombre: foundCargo.nombre,
              tips: foundCargo.tips,
              updatedAt: foundCargo.updatedAt,
            } as CargoList,
            operation: "DELETE",
          },
        });
        return {
          ok: true,
          message: "Cargo eliminado correctamente.",
        };
      } catch (e) {
        console.log("DeleteCargo Error", e);
        return {
          ok: false,
          message: e?.message,
        };
      }
    },
  },
  Query: {
    listarCargos: async (
      _: any,
      __: any,
      context: any
    ): Promise<CargoList[]> => {
      try {
        await checkAuth(context, [
          EnumRoles.admin,
          EnumRoles.tribunal,
          EnumRoles.cordinador,
        ]);
        const cargos = await getRepository(Cargo).find();
        const formatCargos = cargos?.map((cargo) => {
          return {
            id: cargo?.id,
            nombre: cargo?.nombre,
            tips: cargo?.tips,
            updatedAt: cargo?.updatedAt,
          };
        });

        return formatCargos;
      } catch (e) {
        return [];
      }
    },
  },
  Subscription: {
    cargoCreated: {
      subscribe: () => pubsub.asyncIterator(["List_Cargos"]),
    },
  },
};

export default cargoController;
