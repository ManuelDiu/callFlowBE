"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const userController_1 = require("./userController");
var controller = {
    message: () => "Message",
    createUser: userController_1.createUser,
    getCurrentUser: userController_1.getCurrentUser,
    login: userController_1.login
};
exports.default = controller;
