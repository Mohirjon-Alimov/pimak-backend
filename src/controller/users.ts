import {Request, Response} from "express";
import {AppDataSource as dataSource} from "../config/ormconfig";

import {UserEntity} from "../entities/users.entity";
import {ErrorHandler} from "../exceptions/errorhandler";
import jwt from "../utils/jwt";

export default {
    REGISTER: async (req: Request, res: Response): Promise<void> => {
        const {username, password} = req.filtered;

        const existingUser = await dataSource.getRepository(UserEntity).findOne({
            where: {
                username,
            },
        });

        if (existingUser) {
            res.status(401).send(new ErrorHandler("User is exists", 401));
            return;
        }

        const newUser = await dataSource
            .getRepository(UserEntity)
            .createQueryBuilder()
            .insert()
            .into(UserEntity)
            .values({username, password})
            .returning(["id"])
            .execute();

        res.status(201).json({
            token: jwt.sign({id: newUser.raw[0].id}),
        });
    },
    NEW_PHONE_NUM: async (req: Request, res: Response): Promise<void> => {
        const {number} = req.body;
        const {token} = req.headers;

        const addphone = await dataSource
            .getRepository(UserEntity)
            .createQueryBuilder()
            .update(UserEntity)
            .set({number})
            .where("id =: id", {id: jwt.verify(String(token))})
            .execute();

        res.send("ok");
    },
    LOGIN: async (req: Request, res: Response): Promise<void> => {
        const {username, password} = req.body;
        const verify = await dataSource.getRepository(UserEntity).findOne({
            where: {
                username,
                password,
            },
        });

        if (verify) {
            res.status(201).json({
                token: jwt.sign({id: verify.id}),
            });
            return;
        }

        res
            .status(400)
            .send(new ErrorHandler("Incorrect username or password ", 400));
        return;
    },
    DELETEACCOUNT: async (req: Request, res: Response): Promise<void> => {
        const {token} = req.headers;

        const getId = jwt.verify(String(token));

        if (await getId) {
            const deleteUser = await dataSource
                .getRepository(UserEntity)
                .createQueryBuilder()
                .delete()
                .from(UserEntity)
                .where("id = :id", {id: getId})
                .execute();

            if (deleteUser) {
                res.status(201).json({message: "User is deleted"});
                return;
            }

            res.status(500).json({message: "Internal server error"});
        }

        res.status(500).json({message: "Internal server error"});
    },
};
