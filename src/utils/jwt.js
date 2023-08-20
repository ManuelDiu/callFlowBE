"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJWT = exports.SECRET_JWT_SEED = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.SECRET_JWT_SEED = process.env.SECRET_JWT_SEED || "secret_seed_word";
const DEFAULT_EXPIRATION_TIME = "2h";
const generateJWT = (id, name) => {
    return new Promise((resolve, reject) => {
        const payload = { id, name };
        jsonwebtoken_1.default.sign(payload, exports.SECRET_JWT_SEED, {
            expiresIn: DEFAULT_EXPIRATION_TIME,
        }, (err, token) => {
            if (err) {
                reject("No se pudo generar el token");
            }
            resolve(token);
        });
    });
};
exports.generateJWT = generateJWT;
