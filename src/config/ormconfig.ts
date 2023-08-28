import path from "path"
import { DataSource } from "typeorm"
// import dotenv from 'dotenv'
// dotenv.config()
import dotenv from 'dotenv/config'
dotenv
const AppDataSource = new DataSource({
  type: "postgres",
  // host: process.env.HOST,
  // password: process.env.PASSWORD,
  // port: 5432,
  // username: process.env.USER_AND_DATABASE,
  // database: process.env.USER_AND_DATABASE,
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "mohir",
  database: "pimak",
  entities: [path.resolve(__dirname, "..", "entities", "*.entity.{ts,js}")],
  migrations: [path.resolve(__dirname, "..", "migrations", "**/*.{ts,js}")],
  logging: true,
  synchronize: false,
})

export { AppDataSource }
