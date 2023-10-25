import { Postulante } from "entities/postulante/postulante.entity";
import {
  PostulanteType,
  PostulanteList,
  UpdatePostulanteInput,
  UpdatePostulanteResponse,
  DeletePostulanteInput,
  CambiarEstadoPostulanteLlamadoInput,
  InfoPostulanteEnLlamadoInput,
  PostulanteInLlamadoResumed,
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
import { DataGrilla } from "types/grillaLlamado";
import { Requisito } from "types/llamados";
import { Puntaje } from "entities/puntaje/puntaje.entity";
import { Requisito as RequisitoEntity } from "entities/requisito/requisito.entity";

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
    guardarPuntajesPostulanteEnLlamado: async (
      _: any,
      {
        data,
      }: {
        data: DataGrilla;
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
          relations: [
            "postulante",
            "llamado",
            "puntajes",
            "puntajes.requisito",
          ],
        });

        // console.log(postulLlamado);
        if(data.requisitos.length < 1){
          throw new Error(
            "No se recibieron requisitos en el payload."
          );
        }
        data.requisitos.forEach(async (currentReq) => {
          const puntajeAlreadyExists = postulLlamado.puntajes.find(
            (puntaje) => currentReq.id === puntaje.requisito.id
          );
          if (!puntajeAlreadyExists) {
            // este requisito aún no está puntuado para este postulante.
            const foundReq = await getRepository(RequisitoEntity).findOne(
              currentReq.id
            );
            if (!foundReq) {
              throw new Error(
                "No se encontró el requisito con el id: " + currentReq.id
              );
            }
            const newPuntaje = new Puntaje();
            newPuntaje.valor = currentReq.nuevoPuntaje;
            newPuntaje.postulante = postulLlamado;
            newPuntaje.requisito = foundReq;
            await getRepository(Puntaje).save(newPuntaje);
          } else {
            const foundPuntaje = await getRepository(Puntaje).findOne({
              where: {
                postulante: { postulante: { id: data.postulanteId } },
                requisito: { id: currentReq.id },
              },
              relations: ["requisito", "postulante", "postulante.postulante"],
            });
            if (!foundPuntaje) {
              throw new Error("No se encontró el puntaje existente.");
            }
            if (foundPuntaje.valor !== currentReq.nuevoPuntaje) {
              foundPuntaje.valor = currentReq.nuevoPuntaje;
              await getRepository(Puntaje).save(foundPuntaje);
              console.log("Puntaje modificado con exito.");
            }
          }
        });

        await getRepository(PostulanteLlamado).save(postulLlamado);

        return {
          ok: true,
          message: "Puntajes guardados correctamente.",
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
          El Administrador (CDP) <span class="userColor">"${usuarioSolicitante.name} ${usuarioSolicitante?.lastName}"</span> cambió el estado del postulante <span class="userColor" >"${postulLlamado.postulante.nombres} ${postulLlamado.postulante?.apellidos}"</span> desde <span class="estadoColor" >"${postulLlamado.estadoActual.nombre}"</span> a <span class="estadoColor" >"${nuevoEstado.nombre}"</span> en el llamado ${postulLlamado?.llamado?.nombre}.
        `;

        await generateHistorialItem({
          text: text,
          llamadoId: data.llamadoId,
          userId: usuarioSolicitante?.id,
        });

        postulLlamado.estadoActual = nuevoEstado;
        postulLlamado.descripcion = data.descripcion || "";

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
        El Miembro del tribunal <span class="userColor">"${usuarioSolicitante.name} ${usuarioSolicitante?.lastName}"</span> solicitó el cambio de estado para el postulante <span class="userColor" >"${postulLlamado.postulante.nombres} ${postulLlamado.postulante?.apellidos}"</span> desde <span class="estadoColor" >"${postulLlamado.estadoActual.nombre}"</span> a <span class="estadoColor" >"${nuevoEstado.nombre}"</span> en el llamado ${foundHistorialItem?.llamado?.nombre}.
        `;

        const newCambio = new Cambio();
        newCambio.nombre = nuevoEstado.nombre;
        newCambio.postulante = postulLlamado;

        postulLlamado.descripcion = data.descripcion || "";
        await getRepository(PostulanteLlamado).save(postulLlamado);

        await generateHistorialItem({
          text: text,
          llamadoId: data.llamadoId,
          userId: usuarioSolicitante?.id,
          cambio: newCambio,
        });

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
        // console.log("PostulanteLlamado", postulLlamado);

        return postulLlamado;
      } catch (e) {
        console.log("ChangePostulanteStateInLlamado Error", e);
        return null;
      }
    },
    getPostulantesByLlamadoId: async (
      _: any,
      { llamadoId }: { llamadoId: number },
      context: any
    ) => {
      try {
        await checkAuth(context, [EnumRoles.admin, EnumRoles.tribunal, EnumRoles.cordinador]);
        const postulLlamado = await getRepository(PostulanteLlamado).find({
          where: {
            llamado: { id: llamadoId },
          },
          relations: ["postulante", "llamado", "etapa", "estadoActual"],
        });

        if (!postulLlamado) {
          throw new Error(
            "No se han encontrado postulantes dentro de este llamado."
          );
        }
        console.log("PostulanteLlamado", postulLlamado);

        const formattedPostulantes: PostulanteInLlamadoResumed[] = postulLlamado.map(
          (item) => {
            return {
              postulante: {
                id: item.postulante.id,
                nombres: item.postulante.nombres,
                apellidos: item.postulante.apellidos,
                documento: item.postulante.documento,
                updatedAt: new Date(item.postulante.updatedAt),
              },
              estadoActual: {
                id: item.estadoActual.id,
                nombre: item.estadoActual.nombre,
                updatedAt: new Date(item.estadoActual.updatedAt),
              },
              etapa: {
                id: item.etapa.id,
                nombre: item.etapa.nombre,
                plazoDias: item.etapa.plazoDias,
                puntajeMin: item.etapa.puntajeMin,
                total: item.etapa.total,
                createdAt: new Date(item.etapa.createdAt),
                updatedAt: new Date(item.etapa.updatedAt),
              },
              updatedAt: new Date(item.updatedAt),
            };
          }
        );

        return formattedPostulantes;
      } catch (error) {
        throw error;
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
