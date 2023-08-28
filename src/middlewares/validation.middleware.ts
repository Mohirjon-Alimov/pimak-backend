import { NextFunction, Request, Response } from "express";
import { ObjectSchema } from "joi";
import { ErrorHandler } from "../exceptions/errorhandler";

export default (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = schema.validate(req.body);

      if (error) {
        next(
          res.json({
            message: error.message,
          })
        );
      }

      req.filtered = value;
      next();
    } catch (error: any) {
      next(new ErrorHandler(error.message, 503));
    }
  };
};
