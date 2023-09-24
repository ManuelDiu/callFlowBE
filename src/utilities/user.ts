import { Usuario } from "entities/usuarios/usuarios.entity";
import { Roles } from "enums/Roles";
import { UserList } from "types/user";


export const DEFAULT_USER_IMAGE = "https://icon-library.com/images/default-user-icon/default-user-icon-13.jpg";


export const formatUserToList = (user: Usuario): UserList => {
    const item: UserList = {
        id: user?.id,
        email: user?.email,
        name: user?.name,
        imageUrl: user?.imageUrl,
        roles: user?.roles?.map((rol) => rol?.nombre as Roles),
        itr: user?.itr,
        lastName: user?.lastName,
        telefono: user?.telefono,
        llamados: user?.tribunales?.length || 0,
        activo: user?.activo,
        documento: user?.documento,
        biografia: user?.biografia,
      };
      return item;
}