import { ConnectionOptions } from "typeorm";

const config: ConnectionOptions = {
    type: "postgres",
    host: "localhost",
    database: "nest-article",
    username: "admin",
    password: "password",
}

export default config;
