import express, { Application } from "express";
import path from "path";
import { AppDataSource } from "./config/ormconfig";
import routes from "./routes";
import cors from 'cors'

const main = async (): Promise<void> => {
  const app: Application = express();
  const PORT = process.env.PORT || 9900;
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
