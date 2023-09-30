import { Postulante } from "entities/postulante/postulante.entity";
import {
  PostulanteType,
  PostulanteList,
  UpdatePostulanteInput,
  UpdatePostulanteResponse,
  DeletePostulanteInput,
} from "types/posstulante";
import { MessageResponse } from "types/response";
import { getRepository } from "typeorm";
import { PubSub } from "graphql-subscriptions";
import { Roles as EnumRoles } from "enums/Roles";
import { checkAuth } from "utilities/checkAuth";

const pubsub = new PubSub();

const postulanteController: any = {
  Mutation: {
    createPostulante: async (
      _: any,
      {
        data,
      }: {
        data: PostulanteType;
      },
      context: any
    ): Promise<MessageResponse> => {
      try {
        await checkAuth(context, [EnumRoles.admin, EnumRoles.tribunal]);
        const foundPostulante = await getRepository(Postulante).findOne({
          documento: data.documento,
        });
        if (foundPostulante) {
          throw new Error(
            `Ya existe un postulante con el documento '${data.documento}'.`
          );
        }

        const newPost = new Postulante();
        newPost.nombres = data.nombres;
        newPost.apellidos = data.apellidos;
        newPost.documento = data.documento;

        const postulCreation = await getRepository(Postulante).save(newPost);
        if (postulCreation.id) {
          pubsub.publish("List_Postulantes", {
            postulanteCreated: {
              postulante: {
                id: postulCreation.id,
                nombres: postulCreation.nombres,
                apellidos: postulCreation.apellidos,
                documento: postulCreation.documento,
                updatedAt: postulCreation.updatedAt,
              } as PostulanteList,
              operation: "CREATE",
            },
          });
          return {
            ok: true,
            message: "Postulante creado correctamente.",
          };
        } else {
          throw new Error("Error al crear postulante.");
        }
      } catch (e) {
        console.log("CreatePostulante Error", e);
        return {
          ok: false,
          message: e?.message,
        };
      }
    },
    updatePostulante: async (
      _: any,
      {
        data,
      }: {
        data: UpdatePostulanteInput;
      },
      context: any
    ): Promise<UpdatePostulanteResponse> => {
      try {
        await checkAuth(context, [EnumRoles.admin, EnumRoles.tribunal]);
        const postulante = await getRepository(Postulante).findOne(data.id);

        if (!postulante) {
          throw new Error("Postulante no encontrado.");
        }

        postulante.documento = data.postulante.documento;
        postulante.nombres = data.postulante.nombres;
        postulante.apellidos = data.postulante.apellidos;

        await getRepository(Postulante).save(postulante);
        pubsub.publish("List_Postulantes", {
          postulanteCreated: {
            postulante: {
              id: postulante.id,
              nombres: postulante.nombres,
              apellidos: postulante.apellidos,
              documento: postulante.documento,
              updatedAt: postulante.updatedAt,
            } as PostulanteList,
            operation: "UPDATE",
          },
        });
        return {
          ok: true,
          message: "Postulante modificado correctamente.",
          postulante: postulante,
        };
      } catch (e) {
        console.log("UpdatePostulante Error", e);
        return {
          ok: false,
          message: e?.message,
        };
      }
    },
    deletePostulante: async (
      _: any,
      {
        data,
      }: {
        data: DeletePostulanteInput;
      },
      context: any
    ): Promise<MessageResponse> => {
      try {
        await checkAuth(context, [EnumRoles.admin, EnumRoles.tribunal]);
        const postulante = await getRepository(Postulante).findOne(data.id);

        if (!postulante) {
          throw new Error("Postulante a eliminar no encontrado.");
        }

        const foundRelation = await getRepository(Postulante)
          .createQueryBuilder("postulante")
          .innerJoin("postulante.llamados", "llamado")
          .where("postulante.id = :postulId", { postulId: postulante.id })
          .getOne();

        if (foundRelation) {
          throw new Error(
            "No puedes eliminar un postulante que esté asociado al menos a un llamado."
          );
        }

        await getRepository(Postulante).delete(data.id);
        pubsub.publish("List_Postulantes", {
          postulanteCreated: {
            postulante: {
              id: postulante.id,
              nombres: postulante.nombres,
              apellidos: postulante.apellidos,
              documento: postulante.documento,
              updatedAt: postulante.updatedAt,
            } as PostulanteList,
            operation: "DELETE",
          },
        });
        return {
          ok: true,
          message: "Postulante eliminado correctamente.",
        };
      } catch (e) {
        console.log("DeletePostulante Error", e);
        return {
          ok: false,
          message: e?.message,
        };
      }
    },
  },
  Query: {
    listarPostulantes: async (
      _: any,
      __: any,
      context: any
    ): Promise<PostulanteList[]> => {
      try {
        await checkAuth(context, [EnumRoles.admin, EnumRoles.tribunal]);
        const postulantes = await getRepository(Postulante).find({
          order: { nombres: "ASC" },
        });
        const formattedPostulantes: PostulanteList[] = postulantes.map((postulante) => {
          const item: PostulanteList = {
            id: postulante?.id,
            nombres: postulante?.nombres,
            apellidos: postulante?.apellidos,
            documento: postulante?.documento,
            updatedAt: postulante?.updatedAt,
          };
          return item;
        });
        return formattedPostulantes;
      } catch (e) {
        return [];
      }
    },
  },
  Subscription: {
    postulanteCreated: {
      subscribe: () => pubsub.asyncIterator(["List_Postulantes"]),
    },
  },
};

export default postulanteController;
