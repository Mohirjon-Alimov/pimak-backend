import {Request, Response} from "express"
import {AppDataSource as dataSource} from "../config/ormconfig"
import {OrdersEntity} from "../entities/orders.entity"
import {ProductsEntity} from "../entities/products.entity"
import {UserEntity} from "../entities/users.entity"
import {ErrorHandler} from "../exceptions/errorhandler"
import jwt from "../utils/jwt"
import {JsonWebTokenError} from "jsonwebtoken";

export default {
    GET: async (req: Request, res: Response): Promise<void> => {
        try {
            const {user_id} = req.headers
            const findOrder = await dataSource.getRepository(OrdersEntity).find({
                where: {user: {id: user_id as string}},
                relations: {
                    user: true,
                    product: true,
                },
                select: {
                    user: {id: true},
                },
            })
            if (findOrder.length == 0 || !findOrder) {
                res.status(200).json({message: "You dont have orders"})
                return
            }

            res.send(findOrder).status(201)
            return

        } catch (err: unknown) {
            if (err instanceof JsonWebTokenError) {
                res.status(403).send(new ErrorHandler(err.message, 500))
                return
            }
            res.send(new ErrorHandler("Internal server error", 500))
        }
    },
    CREATE: async (req: Request, res: Response): Promise<void> => {
        const {token} = req.headers

        const products: any[] = req.body.products

        try {
            const user: any = jwt.verify(String(token))
            // const user_id = user.id

            if (user) {
                const userProduct = await dataSource.getRepository(UserEntity).findOne({
                    where: {
                        id: user.id,
                    },
                    relations: {
                        products: true,
                    },
                    select: {
                        products: {
                            orders: {
                                count: true,
                            },
                            brand: true,
                            color: true,
                            description: true,
                            discountPersent: true,
                            discountprice: true,
                            id: true,
                            maded_country: true,
                            orders_count: true,
                            price: true,
                            title: true,
                        },
                    },
                })

                const myProduct = userProduct?.products.find(e => products.find(l => l.id === e.id))
                if (myProduct) {
                    res.send(new ErrorHandler("You cant order your own product!!!", 400))
                    return
                }

                products.map(async (product) => {
                    const existing = await dataSource.getRepository(ProductsEntity).findOne({where: {id: product.id}})
                    if (!existing) {
                        res.send(new ErrorHandler("Product not found", 404))
                        return
                    }
                })

                const arr = products.map(product => {
                    product.user = user.id
                    product.product = product.id
                    delete product.id
                    return product
                })

                await dataSource
                    .getRepository(OrdersEntity)
                    .createQueryBuilder()
                    .insert()
                    .into(OrdersEntity)
                    .values(
                        arr
                    )
                    .execute()

                res.status(201).json("ok")
                return


            }
            // if (userProduct?.products.find((e) => e.id == id)?.id == id) {
            //   res.send(new ErrorHandler("You cant order your own product!!!", 400))
            //   return
            // }


        } catch (err: unknown) {
            if (err instanceof JsonWebTokenError) {
                res.status(403).send(new ErrorHandler(err.message, 500))
                return
            }
            res.send(new ErrorHandler("Internal server error", 500))
            return
        }
    },
    DELETE: async (req: Request, res: Response): Promise<void> => {
        const {token} = req.headers
        const {id} = req.params

        try {
            const user = jwt.verify(String(token)) as string
            const findOrder = await dataSource.getRepository(OrdersEntity).find({where: {id}})
            if ((user as string && findOrder)) {
                await dataSource
                    .getRepository(OrdersEntity)
                    .createQueryBuilder()
                    .delete()
                    .from(OrdersEntity)
                    .where("id = :id", {id})
                    .execute()
                res.status(201).json("Deleted")
                return
            }
            res.send(new ErrorHandler("Bad request", 400))
            return
        } catch (err: unknown) {
            res.send(new ErrorHandler("Internal server error", 500))
            return
        }
    },
}
