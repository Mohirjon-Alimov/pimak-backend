import { NextFunction, Request, Response } from "express";
import jwt from "../utils/jwt";
import { ErrorHandler } from "../exceptions/errorhandler";

export const CheckToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { authorization } = req.headers;
    const check:any = jwt.verify(authorization as string);
    // req.body.id =check.id.toString();
    const {id} = check
    req.headers.user_id = id;
    next();
  } catch (e : any) {
    res.status(403).send(new ErrorHandler(e.message , 403));
  }
};
