import express, { Application } from "express";
import path from "path";
import { AppDataSource } from "./config/ormconfig";
import routes from "./routes";
import cors from 'cors'
import {CheckToken} from "./middlewares/checkToken";

const main = async (): Promise<void> => {
  const app: Application = express();
  const PORT = process.env.PORT;
  try {
    app.use(cors())
    app.use(express.json());
    await AppDataSource.initialize();

    app.use(routes);
    app.use(
      "/uploads",
      express.static(path.join(process.cwd(), "src", "uploads"))
    );
  } catch (err) {
    console.log(err);
  } finally {
    app.listen(PORT, (): void => {
      console.log(PORT);
    });
  }
};

main();
