import { storage, uploadFilter } from "../utils/multer";
import { NextFunction, Request, Response } from "express";
import upload, { MulterError } from "multer";
import { ErrorHandler } from "../exceptions/errorhandler";
import { AppDataSource } from "../config/ormconfig";
import { PicturesEntity } from "../entities/picture.entity";

const multer = upload({
  storage,
  fileFilter: uploadFilter,
  limits: { fileSize: 3 * 1024000 },
});

export default {
  create: async (req: Request, res: Response, next: NextFunction) => {
    const fileupload = multer.fields([
      { name: "pic", maxCount: 5 },
      { name: "image", maxCount: 1 },
    ]);
    fileupload(req, res, function (err) {
      if (err instanceof MulterError) {
        // A Multer error occurred when uploading.
        console.log(err.message);
        res.status(400).send(new ErrorHandler(err.message, 400));
        return;
      }
      next();
    });
  },
  update: async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const pictures = await AppDataSource.getRepository(PicturesEntity).find({
      relations: {
        product: true,
      },
      where: {
        product: {
          id,
        },
      },
      select: {
        pic: true,
        id: true,
        product: {
          id: true,
        },
      },
    });

    if (pictures.length == 5) {
      res.status(400).send(new ErrorHandler("Maximum number of photos 5", 400));
      return;
    }

    const fileupload = multer.fields([
      { name: "pic", maxCount: 5 - pictures.length },
      { name: "image", maxCount: 1 },
    ]);
    fileupload(req, res, function (err) {
      if (err instanceof MulterError) {
        res.status(400).send(new ErrorHandler(err.message, 400));
        return;
      }
      next();
    });
  },
};
