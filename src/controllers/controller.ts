import { createUser, login, getCurrentUser } from "./userController";

var controller = {
    message: () => "Message",
    createUser: createUser,
    getCurrentUser: getCurrentUser,
    login: login
};



export default controller;