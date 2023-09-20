import { Roles } from "enums/Roles";
import { isAdmin } from "middlewares/permission-handler.middleware";
import { checkAuth } from "utilities/checkAuth";

const llamadoController: any = {
  Mutation: {
    prueba: async (_: any, __: any, context: any, ) => {
        await checkAuth(context, [Roles.cordinador, Roles.admin]);
    
        return "solo llega si el usuario tiene rol cordinador o admin";
      }
  }
};

export default llamadoController;
