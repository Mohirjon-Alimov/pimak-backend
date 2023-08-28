import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { MulterError } from "multer";
import upload from "multer";
import path from "path";
import { ErrorHandler } from "../exceptions/errorhandler";

export const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "src", "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

export const uploadFilter = function (req: any, file: any, cb: any) {
  var typeArray = file.mimetype.split("/");
  var fileType = typeArray[1];
  if (fileType == "jpg" || fileType == "png" || fileType == "jpeg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

