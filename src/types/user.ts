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
    lastName?: string;
    image: string;
    biografia?: string;
    roles: Roles[],
    itr: ITR,
    telefono: string,
}

export type UserList = {
    email: string;
    name?: string;
    lastName?: string,
    imageUrl?: string;
    roles: Roles[];
    itr?: ITR;
    telefono: string,
    llamados: number,
    activo: Boolean
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

export type ResetPasswordInput = {
    token: string;
    password: string;
    newPassword: string;
}