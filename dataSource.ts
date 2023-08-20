import { DataSource } from"typeorm"

const myDataSource = new DataSource({
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



export default myDataSource;