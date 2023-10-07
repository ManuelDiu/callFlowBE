import { Postulante } from "entities/postulante/postulante.entity";
import {
  PostulanteType,
  PostulanteList,
  UpdatePostulanteInput,
  UpdatePostulanteResponse,
  DeletePostulanteInput,
  CambiarEstadoPostulanteLlamadoInput,
  InfoPostulanteEnLlamadoInput,
} from "types/posstulante";
import { MessageResponse } from "types/response";
import { getRepository } from "typeorm";
import { PubSub } from "graphql-subscriptions";
import { Roles as EnumRoles } from "enums/Roles";
import { checkAuth } from "utilities/checkAuth";
import { PostulanteLlamado } from "entities/postulanteLlamado/postulanteLlamado.entity";
import { EstadoPostulante } from "entities/estadoPostulante/estadoPostulante.entity";
import { HistorialItem } from "entities/historialitem/historialitem.entity";
import { Cambio } from "entities/cambio/cambio.entity";
import { Usuario } from "entities/usuarios/usuarios.entity";
import { TipoMiembro } from "enums/TipoMiembro";
import { generateHistorialItem } from "utilities/llamado";

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
    cambiarEstadoPostulanteLlamado: async (
      _: any,
      {
        data,
      }: {
        data: CambiarEstadoPostulanteLlamadoInput;
      },
      context: any
    ): Promise<MessageResponse> => {
      try {
        await checkAuth(context, [EnumRoles.admin]);
        const postulLlamado = await getRepository(PostulanteLlamado).findOne({
          where: {
            postulante: { id: data.postulanteId },
            llamado: { id: data.llamadoId },
          },
          relations: ["postulante", "llamado", "estadoActual"],
        });

        if (!postulLlamado) {
          throw new Error("Postulante en llamado no encontrado.");
        }
        // console.log(postulLlamado);

        const usuarioSolicitante = await getRepository(Usuario).findOne({
          where: {
            id: data?.solicitanteId,
          },
          relations: ["tribunales", "tribunales.llamado"],
        });

        if (!usuarioSolicitante) {
          throw new Error("Usuario solicitante no encontrado.");
        }

        const nuevoEstado = await getRepository(EstadoPostulante).findOne({
          nombre: data?.nuevoEstado,
        });

        if (!nuevoEstado) {
          throw new Error("Estado posible de postulante no encontrado.");
        }

        if (data.nuevoEstado == postulLlamado.estadoActual.nombre) {
          throw new Error(
            "El postulante ya se encuentra en el estado al que se desea cambiar."
          );
        }

        const text = `
          El Administrador (CDP) <span class="userColor">"${usuarioSolicitante.name} ${usuarioSolicitante?.lastName}"</span> cambió el estado del postulante <span class="userColor" >"${postulLlamado.postulante.nombres} ${postulLlamado.postulante?.apellidos}"</span> desde <span class="estadoColor" >"${postulLlamado.estadoActual.nombre}"</span> a <span class="estadoColor" >"${nuevoEstado.nombre}"</span>.
        `;

        await generateHistorialItem(
          text,
          data.llamadoId,
          usuarioSolicitante?.id
        );

        postulLlamado.estadoActual = nuevoEstado;

        await getRepository(PostulanteLlamado).save(postulLlamado);
        return {
          ok: true,
          message: "Cambio de estado del postulante exitoso.",
        };
      } catch (e) {
        console.log("ChangePostulanteStateInLlamado Error", e);
        return {
          ok: false,
          message: e?.message,
        };
      }
    },
    cambiarEstadoPostulanteLlamadoTribunal: async (
      _: any,
      {
        data,
      }: {
        data: CambiarEstadoPostulanteLlamadoInput;
      },
      context: any
    ): Promise<MessageResponse> => {
      try {
        await checkAuth(context, [EnumRoles.tribunal]);
        const postulLlamado = await getRepository(PostulanteLlamado).findOne({
          where: {
            postulante: { id: data.postulanteId },
            llamado: { id: data.llamadoId },
          },
          relations: ["postulante", "llamado", "estadoActual"],
        });

        if (!postulLlamado) {
          throw new Error("Postulante en llamado no encontrado.");
        }
        // console.log("postLlamado____ ", postulLlamado);

        const foundHistorialItem = await getRepository(HistorialItem).findOne({
          where: {
            cambio: { postulante: { postulante: { id: data.postulanteId } } },
            llamado: { id: data.llamadoId },
          },
          relations: [
            "cambio",
            "llamado",
            "cambio.postulante",
            "cambio.postulante.postulante",
          ],
        });

        // console.log("foundHistItem___", foundHistorialItem);

        if (foundHistorialItem) {
          if (
            foundHistorialItem.cambio.postulante.postulante.id ===
              data.postulanteId &&
            foundHistorialItem.cambio.cambio === null
          ) {
            throw new Error(
              "El postulante ya cuenta con un cambio pendiente a aprobar por CDP."
            );
          }
        }

        const nuevoEstado = await getRepository(EstadoPostulante).findOne({
          nombre: data?.nuevoEstado,
        });

        if (!nuevoEstado) {
          throw new Error("Estado posible de postulante no encontrado.");
        }

        if (data.nuevoEstado == postulLlamado.estadoActual.nombre) {
          throw new Error(
            "El postulante ya se encuentra en el estado al que se desea cambiar."
          );
        }

        const usuarioSolicitante = await getRepository(Usuario).findOne({
          where: {
            id: data?.solicitanteId,
          },
          relations: ["tribunales", "tribunales.llamado"],
        });

        if (!usuarioSolicitante) {
          throw new Error("Usuario solicitante no encontrado.");
        }

        // filtro el array de los tribunales al que el miembro pertenece, por el id del llamado actual.
        const tribunalLlamadoFiltrado = usuarioSolicitante.tribunales.find(
          (tribunalLlamado) => tribunalLlamado.llamado.id === data.llamadoId
        );

        if (tribunalLlamadoFiltrado.tipoMiembro !== TipoMiembro.titular) {
          throw new Error(
            "No tienes acceso al cambio de estado del postulante, ya que actualmente no eres titular en este llamado."
          );
        }

        const text = `
        El Miembro del tribunal <span class="userColor">"${usuarioSolicitante.name} ${usuarioSolicitante?.lastName}"</span> solicitó el cambio de estado para el postulante <span class="userColor" >"${postulLlamado.postulante.nombres} ${postulLlamado.postulante?.apellidos}"</span> desde <span class="estadoColor" >"${postulLlamado.estadoActual.nombre}"</span> a <span class="estadoColor" >"${nuevoEstado.nombre}"</span>.
        `;

        const newCambio = new Cambio();
        newCambio.nombre = nuevoEstado.nombre;
        newCambio.postulante = postulLlamado;

        await generateHistorialItem(
          text,
          data.llamadoId,
          usuarioSolicitante?.id,
          newCambio,
        );

        return {
          ok: true,
          message: "Cambio de estado de postulante solicitado con éxito.",
        };
      } catch (e) {
        console.log("ChangePostulanteStateInLlamadoTribunal Error", e);
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
        const formattedPostulantes: PostulanteList[] = postulantes.map(
          (postulante) => {
            const item: PostulanteList = {
              id: postulante?.id,
              nombres: postulante?.nombres,
              apellidos: postulante?.apellidos,
              documento: postulante?.documento,
              updatedAt: postulante?.updatedAt,
            };
            return item;
          }
        );
        return formattedPostulantes;
      } catch (e) {
        return [];
      }
    },
    infoPostulanteEnLlamado: async (
      _: any,
      {
        postulanteId,
        llamadoId,
      }: {
        postulanteId: number;
        llamadoId: number;
      },
      context: any
    ) => {
      try {
        await checkAuth(context, [EnumRoles.admin, EnumRoles.tribunal]);
        const postulLlamado = await getRepository(PostulanteLlamado).findOne({
          where: {
            postulante: { id: postulanteId },
            llamado: { id: llamadoId },
          },
          relations: [
            "postulante",
            "llamado",
            "llamado.cargo",
            "archivos",
            "archivos.tipoArchivo",
            "estadoActual",
          ],
        });

        if (!postulLlamado) {
          throw new Error("Postulante en llamado no encontrado.");
        }
        console.log("PostulanteLlamado", postulLlamado);

        return postulLlamado;
      } catch (e) {
        console.log("ChangePostulanteStateInLlamado Error", e);
        return null;
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
