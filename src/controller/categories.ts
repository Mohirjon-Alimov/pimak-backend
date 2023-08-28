import { Request, Response } from "express";
import { AppDataSource as dataSource } from "../config/ormconfig";
import { Client } from "../config/redis";
import { CategoriesEntity } from "../entities/categories.entity";
import { ErrorHandler } from "../exceptions/errorhandler";
import jwt from "../utils/jwt";

export default {
  CREATE: async (req: Request, res: Response): Promise<void> => {
    const { title } = req.body;
    // const {token} = req.headers
    // try{
    //   const user_id = jwt.verify(String(token))
    //   console.log(user_id);

    // }catch(err){
    //   res.send(new ErrorHandler("internal server error", 400))
    // }

    console.log(title);

    try {
      const existing = await dataSource
        .getRepository(CategoriesEntity)
        .findOne({
          where: {
            title,
          },
        });

      if (existing) {
        res.status(400).send(new ErrorHandler("This category is exists", 400));
        return;
      }

      const newCategory = await dataSource
        .getRepository(CategoriesEntity)
        .createQueryBuilder()
        .insert()
        .into(CategoriesEntity)
        .values({ title })
        .execute();

      if (newCategory.raw[0].id) {
        res.status(201).json({
          message: "Category created",
          data: newCategory,
        });
        return;
      }

      res.send(new ErrorHandler("Internal server error", 500));
    } catch (err) {
      console.log(err);
      res.status(500).send("err");
    }
  },
  // GETALL: async (req: Request, res: Response): Promise<void> => {
  //   // const{ page, limit } = req.query as any
  //   // const skipping = page * limit

  //   try {
  //     const client = await Client();
  //     const chache = await client?.get("categories");
  //     if (!chache) {
  //       const raw = await dataSource.getRepository(CategoriesEntity).find({
  //         // take: limit,
  //         // skip:skipping,
  //         relations: {
  //           products: true,
  //         },
  //       });
  //       await client?.setEx("categories", 15, JSON.stringify(raw));
  //       res.send(raw);
  //       return;
  //     }
  //     res.send(JSON.parse(chache));
  //     return;
  //   } catch (err: unknown) {
  //     res.send(new ErrorHandler("Internal server error", 500));
  //   }
  // },
  GETONLY: async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await dataSource.getRepository(CategoriesEntity).find();
      res.send(data);
    } catch (e) {
      console.log(e);
      res.status(500).send(new ErrorHandler("Internal server error", 500));
    }
  },
  UPDATE: async (req: Request, res: Response): Promise<void> => {
    const { title, id } = req.body;
    const existing = await dataSource
      .getRepository(CategoriesEntity)
      .findOne({ where: { id } });

    if (existing) {
      const data = await dataSource
        .getRepository(CategoriesEntity)
        .createQueryBuilder()
        .update(CategoriesEntity)
        .set({ title: title })
        .where("id = :id", { id })
        .execute();
      res.status(201).json({ message: "Category succesfully updated" });
      return;
    }
    res.send(new ErrorHandler("Category not found", 400));
  },
  DELETE: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.body;

    const existing = await dataSource.getRepository(CategoriesEntity).findOne({
      where: {
        id,
      },
    });
    if (!existing) {
      res.send(new ErrorHandler("Category not found", 500));
      return;
    }
    const deleting = await dataSource
      .getRepository(CategoriesEntity)
      .createQueryBuilder()
      .delete()
      .from(CategoriesEntity)
      .where("id = :id", { id })
      .execute();
    res.status(200).json({ message: "Category is deleted" });
  },
};
