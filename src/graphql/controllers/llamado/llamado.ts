import { isAdmin } from "middlewares/permission-handler.middleware";
import { checkAuth } from "utilities/checkAuth";

const llamadoController: any = {
  Mutation: {
    prueba: async (_: any, __: any, context: any) => {
        console.log("other", context)
        // checkAuth(context);
        // console.log("data1", data1)
        // console.log("data2", data2)
        // console.log("data3", data3)
    
        return "test";
      }
  }
};

export default llamadoController;
