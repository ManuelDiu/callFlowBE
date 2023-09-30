import { MessageResponse } from "types/response";
import { getRepository } from "typeorm";
import { PubSub } from "graphql-subscriptions";
import {
  DeleteTipoArchivoInput,
  TipoArchivoListItem,
  TipoArchivoType,
  UpdateTipoArchivoInput,
  UpdateTipoArchivoResponse,
} from "types/tipoArchivo";
import { Roles as EnumRoles } from "enums/Roles";
import { TipoArchivo } from "entities/tipoArchivo/tipoArchivo.entity";
import { checkAuth } from "utilities/checkAuth";

const pubsub = new PubSub();

const tipoArchivoController: any = {
  Mutation: {
    createTipoArchivo: async (
      _: any,
      {
        data,
      }: {
        data: TipoArchivoType;
      },
      context: any
    ): Promise<MessageResponse> => {
      try {
        await checkAuth(context, [EnumRoles.admin]);
        // check if TArch already exists by its name
        const foundTA = await getRepository(TipoArchivo).findOne({
          nombre: data.nombre,
        });
        if (foundTA) {
          throw new Error(`El tipo de archivo '${data.nombre}' ya existe.`);
        }

        const newTA = new TipoArchivo();
        newTA.nombre = data.nombre;
        newTA.origen = data.origen;

        const tipoArchivoCreation = await getRepository(TipoArchivo).save(
          newTA
        );
        if (tipoArchivoCreation.id) {
          pubsub.publish("List_TipoArchivo", {
            tipoArchivoCreated: {
              tipoArchivo: {
                id: tipoArchivoCreation.id,
                nombre: tipoArchivoCreation.nombre,
                origen: tipoArchivoCreation.origen,
                updatedAt: tipoArchivoCreation.updatedAt,
              } as TipoArchivoListItem,
              operation: "CREATE",
            },
          });
          return {
            ok: true,
            message: "Tipo de archivo creado correctamente.",
          };
        } else {
          throw new Error("Error al crear el tipo de archivo.");
        }
      } catch (e) {
        console.log("CreateTipArchivo Error", e);
        return {
          ok: false,
          message: e?.message,
        };
      }
    },
    updateTipoArchivo: async (
      _: any,
      {
        data,
      }: {
        data: UpdateTipoArchivoInput;
      },
      context: any
    ): Promise<UpdateTipoArchivoResponse> => {
      try {
        await checkAuth(context, [EnumRoles.admin]);
        const foundTA = await getRepository(TipoArchivo).findOne(data.id);

        if (!foundTA) {
          throw new Error("Tipo archivo no encontrado.");
        }

        foundTA.nombre = data.tipoArchivo.nombre;
        foundTA.origen = data.tipoArchivo.origen;

        await getRepository(TipoArchivo).save(foundTA);
        pubsub.publish("List_TipoArchivo", {
          tipoArchivoCreated: {
            tipoArchivo: {
              id: foundTA.id,
              nombre: foundTA.nombre,
              origen: foundTA.origen,
              updatedAt: foundTA.updatedAt,
            } as TipoArchivoListItem,
            operation: "UPDATE",
          },
        });
        return {
          ok: true,
          message: "Tipo archivo modificado correctamente.",
          tipoArchivo: foundTA,
        };
      } catch (e) {
        console.log("UpdateTipArchivo Error", e);
        return {
          ok: false,
          message: e?.message,
        };
      }
    },
    deleteTipoArchivo: async (
      _: any,
      {
        data,
      }: {
        data: DeleteTipoArchivoInput;
      },
      context: any
    ): Promise<MessageResponse> => {
      try {
        await checkAuth(context, [EnumRoles.admin]);
        const foundTA = await getRepository(TipoArchivo).findOne(data.id);

        if (!foundTA) {
          throw new Error("Tipo archivo a eliminar no encontrado.");
        }

        const foundRelation = await getRepository(TipoArchivo)
          .createQueryBuilder("tipoarchivo")
          .innerJoin("tipoarchivo.archivos", "archivo")
          .where("tipoarchivo.id = :tipArch", { tipArch: foundTA.id })
          .getOne();

        if (foundRelation) {
          throw new Error(
            "No puedes eliminar un tipo de archivo que tenga asociado al menos un archivo en el sistema."
          );
        }

        await getRepository(TipoArchivo).delete(data.id);
        pubsub.publish("List_TipoArchivo", {
          tipoArchivoCreated: {
            tipoArchivo: {
              id: foundTA.id,
              nombre: foundTA.nombre,
              origen: foundTA.origen,
              updatedAt: foundTA.updatedAt,
            } as TipoArchivoListItem,
            operation: "DELETE",
          },
        });
        return {
          ok: true,
          message: "Tipo archivo eliminado correctamente.",
        };
      } catch (e) {
        console.log("DeleteTipArchivo Error", e);
        return {
          ok: false,
          message: e?.message,
        };
      }
    },
  },
  Query: {
    listTiposArchivo: async (
      _: any,
      __: any,
      context: any
    ): Promise<TipoArchivoListItem[]> => {
      try {
        await checkAuth(context, [EnumRoles.admin, EnumRoles.tribunal, EnumRoles.cordinador]);
        const tiposArchivo = await getRepository(TipoArchivo).find({
          order: { nombre: "ASC" },
        });
        const formattedTAs: TipoArchivoListItem[] = tiposArchivo.map((ta) => {
          const item: TipoArchivoListItem = {
            id: ta?.id,
            nombre: ta?.nombre,
            origen: ta?.origen,
            updatedAt: ta?.updatedAt,
          };
          return item;
        });
        return formattedTAs;
      } catch (e) {
        return [];
      }
    },
  },
  Subscription: {
    tipoArchivoCreated: {
      subscribe: () => pubsub.asyncIterator(["List_TipoArchivo"]),
    },
  },
};

export default tipoArchivoController;
