"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const myDataSource = new typeorm_1.DataSource({
    "type": "mysql",
    "host": "127.0.0.1",
    "port": 3306,
    "username": "root",
    "password": "root",
    "database": "anime",
    "entities": [
        "src/models/*.js"
    ],
    "synchronize": true
});
exports.default = myDataSource;
