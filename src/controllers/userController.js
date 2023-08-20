"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.login = exports.createUser = void 0;
const dataSource_1 = __importDefault(require("../../dataSource"));
const user_1 = require("../models/user");
const bcrypt_1 = __importDefault(require("bcrypt"));
const bcrypt_2 = require("../utils/bcrypt");
const jwt_1 = require("../utils/jwt");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const saltRounds = 10;
const createUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const persona = data === null || data === void 0 ? void 0 : data.persona;
        if (!persona || typeof persona === "undefined" || persona == null) {
            console.log("me llega", data);
            throw new Error("Error, usuario invalido");
        }
        const userPass = yield bcrypt_1.default.hash(persona.password, 12);
        if (!userPass) {
            throw new Error("Error al procesar la contrase;a");
        }
        persona.password = userPass;
        const newpersona = yield dataSource_1.default.getRepository(user_1.User).create(persona);
        const result = yield dataSource_1.default.getRepository(user_1.User).save(newpersona);
        if (result === null || result === void 0 ? void 0 : result.id) {
            return {
                ok: true,
                message: "Persona creada correctamente",
            };
        }
        else {
            return {
                ok: false,
                message: "Error al crear persona",
            };
        }
    }
    catch (error) {
        return {
            ok: false,
            message: (error === null || error === void 0 ? void 0 : error.message) || "Error al crear personaa",
        };
    }
});
exports.createUser = createUser;
const login = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const credentials = data === null || data === void 0 ? void 0 : data.credentials;
        if (!credentials.email || !credentials.password) {
            throw new Error("Credenciales invalidas");
        }
        const user = yield dataSource_1.default.getRepository(user_1.User).findOneBy({
            email: credentials.email,
        });
        const isSame = yield (0, bcrypt_2.compareAsync)(credentials.password, user === null || user === void 0 ? void 0 : user.password);
        if (isSame) {
            const token = (0, jwt_1.generateJWT)(user === null || user === void 0 ? void 0 : user.id, user === null || user === void 0 ? void 0 : user.nombre);
            return {
                ok: true,
                token: token,
            };
        }
        else {
            throw new Error("Invalid credentials");
        }
    }
    catch (error) {
        return {
            ok: false,
            token: null,
        };
    }
});
exports.login = login;
const getCurrentUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = data === null || data === void 0 ? void 0 : data.token;
        const response = jsonwebtoken_1.default.verify(token, jwt_1.SECRET_JWT_SEED);
        if (response === null || response === void 0 ? void 0 : response.id) {
            const userInfo = yield dataSource_1.default.getRepository(user_1.User).findOneBy({ id: response === null || response === void 0 ? void 0 : response.id });
            return userInfo;
        }
        else {
            return null;
        }
    }
    catch (error) {
        console.log(error);
        return null;
    }
});
exports.getCurrentUser = getCurrentUser;
