import {NextFunction, Request, Response} from "express";
import jwt from "../utils/jwt";
import {ErrorHandler} from "../exceptions/errorhandler";
import {AppDataSource as dataSource} from "../config/ormconfig";
import {UserEntity} from "../entities/users.entity";

export const CheckForAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {authorization} = req.headers;
        const check: any = jwt.verify(String(authorization));

        const {id} = check
        req.headers.user_id = id;
        const verify = await dataSource.getRepository(UserEntity).findOne({
            where: {
                id: id,
                type: "admin"
            },
        });
        if (verify?.type == 'admin') return next();

        res.status(403).send(new ErrorHandler('You are not permitted to perform this action!', 403))
        return
    } catch (e: any) {
        res.status(403).send(new ErrorHandler('Token expired', 403));
    }
};
