"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareAsync = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const compareAsync = (param1, param2) => {
    return new Promise(function (resolve, reject) {
        bcrypt_1.default.compare(param1, param2, function (err, res) {
            if (err) {
                reject(err);
            }
            else {
                resolve(res);
            }
        });
    });
};
exports.compareAsync = compareAsync;
