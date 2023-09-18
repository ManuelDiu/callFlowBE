import { ITR } from "enums/ITR";
import { Roles } from "enums/Roles";


export type CreateUserType = {
    email: string;
    password: string;
    name?: string;
    lastname?: string;
    image: string;
    biografia?: string;
    roles: Roles[],
    itr: ITR,
    telefono: string,
}

export type UsuarioInfo = {
    email: string;
    name?: string;
    lastname?: string;
    image: string;
    biografia?: string;
    roles: Roles[],
    itr: ITR,
    telefono: string,
}

export type LoginCredentials = {
    email: string;
    password: string;
}


export type CreateUserResponse = {
    ok: boolean;
    token?: string;
    message?: string;
}