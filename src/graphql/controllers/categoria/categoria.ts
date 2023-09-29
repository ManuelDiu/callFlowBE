import { Categoria } from "entities/categoria/categoria.entity";
import {
  AddCategoriesToLlamadoType,
  CategoriaType,
  UpdateCategoriaInput,
  UpdateCategoryResponse,
  DeleteCategoriaInput,
  CategoriaListItem,
} from "types/categoria";
import { MessageResponse } from "types/response";
import { getRepository } from "typeorm";
import { Llamado } from "entities/llamado/llamado.entity";
import { PubSub } from "graphql-subscriptions";
import { Roles as EnumRoles } from "enums/Roles";
import { checkAuth } from "utilities/checkAuth";
const pubsub = new PubSub();

const categoriaController: any = {
  Mutation: {
    createCategory: async (
      _: any,
      {
        data,
      }: {
        data: CategoriaType;
      },
      context: any
    ): Promise<MessageResponse> => {
      try {
        await checkAuth(context, [EnumRoles.admin]);
        // check if category already exists by its name
        const foundCategory = await getRepository(Categoria).findOne({
          nombre: data.nombre,
        });
        if (foundCategory) {
          throw new Error(`La categoría '${data.nombre}' ya existe.`);
        }

        const newCat = new Categoria();
        newCat.nombre = data.nombre;

        const categoryCreation = await getRepository(Categoria).save(newCat);
        if (categoryCreation.id) {
          pubsub.publish("List_Categories", {
            categoryCreated: {
              categoria: {
                id: categoryCreation.id,
                nombre: categoryCreation.nombre,
                updatedAt: categoryCreation.updatedAt,
              } as CategoriaListItem,
              operation: "CREATE",
            },
          });
          return {
            ok: true,
            message: "Categoría creada correctamente.",
          };
        } else {
          throw new Error("Error al crear la categoría.");
        }
      } catch (e) {
        console.log("CreateCategory Error", e);
        return {
          ok: false,
          message: e?.message,
        };
      }
    },
    updateCategory: async (
      _: any,
      {
        data,
      }: {
        data: UpdateCategoriaInput;
      },
      context: any
    ): Promise<UpdateCategoryResponse> => {
      try {
        await checkAuth(context, [EnumRoles.admin]);
        const category = await getRepository(Categoria).findOne(data.id);

        if (!category) {
          throw new Error("Categoría no encontrada.");
        }

        category.nombre = data.categoria.nombre;

        await getRepository(Categoria).save(category);
        pubsub.publish("List_Categories", {
          categoryCreated: {
            categoria: {
              id: category.id,
              nombre: category.nombre,
              updatedAt: category.updatedAt,
            } as CategoriaListItem,
            operation: "UPDATE",
          },
        });
        return {
          ok: true,
          message: "Categoría modificada correctamente.",
          categoria: category,
        };
      } catch (e) {
        console.log("UpdateCategory Error", e);
        return {
          ok: false,
          message: e?.message,
        };
      }
    },
    deleteCategory: async (
      _: any,
      {
        data,
      }: {
        data: DeleteCategoriaInput;
      },
      context: any
    ): Promise<MessageResponse> => {
      try {
        await checkAuth(context, [EnumRoles.admin]);
        const category = await getRepository(Categoria).findOne(data.id);

        if (!category) {
          throw new Error("Categoría a eliminar no encontrada.");
        }

        const foundRelation = await getRepository(Categoria)
          .createQueryBuilder("categoria")
          .innerJoin("categoria.llamados", "llamado")
          .where("categoria.id = :categoriaId", { categoriaId: category.id })
          .getOne();

        if (foundRelation) {
          throw new Error(
            "No puedes eliminar una categoría que esté asociada al menos a un llamado."
          );
        }

        await getRepository(Categoria).delete(data.id);
        pubsub.publish("List_Categories", {
          categoryCreated: {
            categoria: {
              id: category.id,
              nombre: category.nombre,
              updatedAt: category.updatedAt,
            } as CategoriaListItem,
            operation: "POST",
          },
        });
        return {
          ok: true,
          message: "Categoría eliminada correctamente.",
        };
      } catch (e) {
        console.log("DeleteCategory Error", e);
        return {
          ok: false,
          message: e?.message,
        };
      }
    },
    addCategoriesToLlamado: async (
      _: any,
      {
        data,
      }: {
        data: AddCategoriesToLlamadoType;
      },
      context: any
    ): Promise<MessageResponse> => {
      try {
        await checkAuth(context, [EnumRoles.admin]);
        const existingCategories = [];
        for (const currCat of data.categorias) {
          const category = await getRepository(Categoria).findOne({
            nombre: currCat.nombre,
          });
          if (category) {
            existingCategories.push(category);
          }
        }

        const llamado = await getRepository(Llamado).findOne(data.llamadoId);

        if (!llamado) {
          throw new Error("Llamado no encontrado.");
        }

        llamado.categorias = existingCategories;

        await getRepository(Llamado).save(llamado);
        return {
          ok: true,
          message: "Categorías agregadas correctamente.",
        };
      } catch (e) {
        console.log("CreateCategory Error", e);
        return {
          ok: false,
          message: e?.message,
        };
      }
    },
  },
  Query: {
    listCategorias: async (
      _: any,
      __: any,
      context: any
    ): Promise<CategoriaListItem[]> => {
      try {
        await checkAuth(context, [
          EnumRoles.admin,
          EnumRoles.tribunal,
          EnumRoles.cordinador,
        ]);
        const categorias = await getRepository(Categoria).find({
          order: { nombre: "ASC" },
        });
        const formattedCats: CategoriaListItem[] = categorias.map((cat) => {
          const item: CategoriaListItem = {
            id: cat?.id,
            nombre: cat?.nombre,
            updatedAt: cat?.updatedAt,
          };
          return item;
        });
        return formattedCats;
      } catch (e) {
        return [];
      }
    },
  },
  Subscription: {
    categoryCreated: {
      subscribe: () => pubsub.asyncIterator(["List_Categories"]),
    },
  },
};

export default categoriaController;
