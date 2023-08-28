import { NextFunction, Request, Response } from "express"
import { ErrorHandler } from "../exceptions/errorhandler"

export default (err: unknown, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof ErrorHandler) {
    res.json({
      message: err.message,
      status: err.status,
    })
  }
  res.json({
    message: "Internal server error",
    status: 500,
  })
}
