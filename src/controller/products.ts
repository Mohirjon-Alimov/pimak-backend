import {Request, Response} from "express";
import {Between, ILike} from "typeorm";
import {AppDataSource as dataSource} from "../config/ormconfig";
import {Client} from "../config/redis";
import {ProductsEntity} from "../entities/products.entity";
import {UserEntity} from "../entities/users.entity";
import {ErrorHandler} from "../exceptions/errorhandler";
import {PicturesEntity} from "../entities/picture.entity";
import {CategoriesEntity} from "../entities/categories.entity";
import {deletefile} from "../utils/file_delete";

const convertPic = (req: Request, data: any): any => {
    const protocol = req.protocol;
    const host = req.hostname;
    const port = process.env.PORT;
    const fullUrl = `${protocol}://${host}:${port}`;

    if (typeof data == "object") {
        return data.pictures.forEach((el: any) => {
            el.pic = `${fullUrl}/uploads/${el.pic}`;
        });
    }

    return data.forEach((k: any) => {
        k.pictures.forEach((el: any) => {
            el.pic = `${fullUrl}/uploads/${el.pic}`;
        });
    });
};
let convertImg = (req: Request, data?: any) => {
    const protocol = req.protocol;
    const host = req.hostname;
    // const url = req.originalUrl;
    const port = process.env.PORT;
    const fullUrl = `${protocol}://${host}:${port}`;
    if (Array.isArray(data)) {
        return data.map((e) => {
            e.image = `${fullUrl}/uploads/${e.image}`;
        });
    }
    return (data.image = `${fullUrl}/uploads/${data.image}`);
};

export default {
    CREATE: async (req: Request, res: Response,): Promise<void> => {
        try {
            const {
                title,
                description,
                category,
                price,
                brand,
                color,
                maded_country,
            } = req.body;
            const {user_id} = req.headers;
            const pictures = req.files as any;

            if (
                title &&
                description &&
                category &&
                price &&
                brand &&
                maded_country &&
                pictures.image &&
                pictures.pic
            ) {
                const Category = await dataSource
                    .getRepository(CategoriesEntity)
                    .findOne({
                        where: {
                            id: category,
                        },
                    });

                if (Category) {
                    const newProduct = await dataSource
                        .getRepository(ProductsEntity)
                        .createQueryBuilder()
                        .insert()
                        .into(ProductsEntity)
                        .values({
                            user_id: user_id as any,
                            title,
                            description,
                            price,
                            category,
                            brand,
                            color,
                            maded_country,
                            image: pictures.image[0].filename,
                        })
                        .execute();

                    if (newProduct.raw[0].id) {
                        const {pic}: any = req?.files;
                        for (let i = 0; i < Number(pic.length); i++) {
                            const name = pic[i].path.split("/").at(-1);

                            await dataSource
                                .getRepository(PicturesEntity)
                                .createQueryBuilder()
                                .insert()
                                .into(PicturesEntity)
                                .values({
                                    pic: name,
                                    product: newProduct.raw[0].id,
                                })
                                .execute();
                        }

                        res.status(201).json({
                            message: "Product successfully created",
                        });
                        return;
                    }
                    res.send(new ErrorHandler("Bad request", 400));
                    return;
                }
            } else {
                res.send(new ErrorHandler("Bad request", 400));
                return;
            }
        } catch (err: unknown) {
            console.log(err);
            res.send(new ErrorHandler("Internal server error", 500));
            return;
        }
    },
    GETCOUNT: async (req: Request, res: Response): Promise<void> => {
        try {
            const data = await dataSource.getRepository(ProductsEntity).count();
            res.status(200).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).send("error");
        }
    },
    GETALL: async (req: Request, res: Response): Promise<void> => {
        try {
            const {page, limit} = req.query as any;
            const skipping = page * limit;
            const client = await Client();
            const cache = await client?.get(`get_all_products_p${page}_l${limit}`);

            if (cache) {
                res.send(JSON.parse(cache));
                return;
            }

            const data = await dataSource.getRepository(ProductsEntity).find({
                relations: {
                    orders: true,
                    category: true,
                },
                select: {
                    id: true,
                    orders: true,
                    brand: true,
                    color: true,
                    description: true,
                    discountPersent: true,
                    discountprice: true,
                    maded_country: true,
                    orders_count: true,
                    price: true,
                    pictures: true,
                    image: true,
                    category: {
                        title: true,
                        id: true,
                    },
                    title: true,
                },
                skip: skipping ? skipping : 0,
                take: limit ? limit : 10,
            });

            convertImg(req, data);

            await client?.setEx(
                `get_all_products_p${page}_l${limit}`,
                15,
                JSON.stringify(data)
            );
            res.send(data);
            return;
        } catch (e) {
            console.log(e);
        }
    },
    GET: async (req: Request, res: Response): Promise<void> => {
        try {
            const {page, limit} = req.query as any;
            const skipping = page * limit;
            const {id} = req.params;
            const client = await Client();
            const cache = await client?.get(`get_products_p${page}_l${limit}_c${id}`);

            if (cache) {
                res.send(JSON.parse(cache));
                return;
            }

            try {
                const existing = await dataSource
                    .getRepository(CategoriesEntity)
                    .findOne({
                        where: {
                            id,
                        },
                    });

                if (!existing) {
                    res.send(new ErrorHandler("Wrong category id", 400));
                    return;
                }
            } catch (err: unknown) {
                res.send(new ErrorHandler("Wrong category id", 400));
                return;
            }

            const data = await dataSource.getRepository(ProductsEntity).find({
                relations: {
                    orders: true,
                    category: true,
                    // pictures: true,
                },
                select: {
                    orders: true,
                    brand: true,
                    color: true,
                    description: true,
                    discountPersent: true,
                    discountprice: true,
                    id: true,
                    maded_country: true,
                    orders_count: true,
                    price: true,
                    pictures: true,
                    image: true,
                    category: {
                        title: true,
                    },
                    title: true,
                },
                where: {category: {id}},
                skip: skipping ? skipping : 0,
                take: limit ? limit : 10,
            });

            // convertPic(req, data);
            convertImg(req, data);

            await client?.setEx(
                `get_products_p${page}_l${limit}_c${id}`,
                15,
                JSON.stringify(data)
            );
            res.send(data);
            return;
        } catch (err: unknown) {
            console.log(err);
            res.send("internal server error");
            return;
        }
    },
    UPDATE: async (req: Request, res: Response): Promise<void> => {
        try {
            const {
                title,
                description,
                category,
                price,
                brand,
                color,
                maded_country,
            } = req.body;
            const {id} = req.params;
            const {user_id} = req.headers;
            const pictures = req.files as any;

            const existing = await dataSource.getRepository(ProductsEntity).findOne({
                where: {id, user_id: {id: user_id as string}},
                relations: {
                    pictures: true,
                    user_id: true,
                },
            });
            if (existing) {
                const updating = await dataSource
                    .getRepository(ProductsEntity)
                    .createQueryBuilder()
                    .update(ProductsEntity)
                    .set({
                        title: title || existing.title,
                        description: description || existing.description,
                        category: category || existing.category,
                        price: price || existing.price,
                        brand: brand || existing.brand,
                        color: color || existing.color,
                        maded_country: maded_country || existing.maded_country,
                        image: pictures.image[0].filename || existing.image,
                    })
                    .where("id = :id", {id})
                    .execute();

                const {pic}: any = req?.files;
                for (let i = 0; i < Number(pic.length); i++) {
                    const name = pic[i].path.split("/").at(-1);

                    await dataSource
                        .getRepository(PicturesEntity)
                        .createQueryBuilder()
                        .insert()
                        .into(PicturesEntity)
                        .values({
                            pic: name,
                            product: existing.id as any,
                        })
                        .execute();
                }

                convertImg(req, updating);
                res.send(updating).status(200);
                return;
            }
            res.send(new ErrorHandler("Product not found", 204));
        } catch (err: unknown) {
            console.log(err);

            res.send(new ErrorHandler("Internal server error", 500));
        }
    },
    DELETE: async (req: Request, res: Response): Promise<void> => {
        const {id} = req.params;
        const {user_id} = req.headers;

        try {
            const existingMyProduct = await dataSource
                .getRepository(ProductsEntity)
                .find({
                    relations: {
                        // comments: true,
                        user_id: true,
                        // orders: true,
                        // stars: true,
                        pictures: true,
                    },
                    select: {
                        user_id: {
                            id: true,
                        },
                    },
                    where: {
                        id,
                        user_id: {
                            id: user_id as string,
                        },
                    },
                });
            if (existingMyProduct.length == 0 || !existingMyProduct) {
                res.send(
                    new ErrorHandler("Product not found, or it is not your product", 204)
                );
                return;
            }

            const productPictures = existingMyProduct[0].pictures;

            deletefile(existingMyProduct[0].image);

            productPictures.forEach((e) => {
                deletefile(e.pic);
            });

            await dataSource
                .getRepository(PicturesEntity)
                .createQueryBuilder()
                .delete()
                .from("pictures")
                .where("productId = id", {id})
                .execute();

            await dataSource
                .getRepository(ProductsEntity)
                .createQueryBuilder()
                .delete()
                .from(ProductsEntity)
                .where("id = :id", {id})
                .execute();

            res.status(200).json({message: "Product is deleted"});
        } catch (err: unknown) {
            res.send(new ErrorHandler("Internal server error", 500));
        }
    },
    // GETTOP: async (req: Request, res: Response): Promise<void> => {
    //     const {page, limit} = req.query as any;
    //     const {id} = req.params;
    //     const skipping = page * limit;
    //
    //     try {
    //         const client = await Client();
    //         const cache = await client?.get(`top_products_p${page}_l${limit}`);
    //
    //         if (!cache) {
    //             const existing = await dataSource
    //                 .getRepository(CategoriesEntity)
    //                 .findOne({
    //                     where: {
    //                         id,
    //                     },
    //                 });
    //             if (!existing) {
    //                 res.send(new ErrorHandler("Wrong category id", 400));
    //                 return;
    //             }
    //             const data = await dataSource.getRepository(ProductsEntity).find({
    //                 where: {category: {id}},
    //                 relations: {
    //                     orders: true,
    //                     category: true,
    //                 },
    //                 select: {
    //                     orders: true,
    //                     brand: true,
    //                     color: true,
    //                     description: true,
    //                     discountPersent: true,
    //                     discountprice: true,
    //                     id: true,
    //                     maded_country: true,
    //                     orders_count: true,
    //                     price: true,
    //                     category: {
    //                         title: true,
    //                     },
    //                     title: true,
    //                 },
    //                 skip: skipping ? skipping : 0,
    //                 take: limit ? limit : 10,
    //             });
    //
    //             if (!data || data.length == 0) {
    //                 res.send(new ErrorHandler("No products", 204));
    //                 return;
    //             }
    //
    //             convertImg(req, top);
    //             await client?.setEx(
    //                 `top_products_p${page}_l${limit}`,
    //                 15,
    //                 JSON.stringify(top)
    //             );
    //
    //             res.send(top);
    //             return;
    //         }
    //         res.send(JSON.parse(cache));
    //         return;
    //     } catch (err: unknown) {
    //         console.log(err);
    //         res.send(new ErrorHandler("Internal server error", 500));
    //     }
    // },
    GETBYID: async (req: Request, res: Response): Promise<void> => {
        try {
            const {id} = req.params;

            const client = await Client();
            const cache = await client?.get(`get_product_id${id}`);

            if (cache) {
                res.send(JSON.parse(cache));
                return;
            }

            const data = await dataSource.getRepository(ProductsEntity).findOne({
                relations: {
                    category: true,
                    orders: true,
                    pictures: true,
                },
                where: {id},
            });
            if (!data) {
                res.send(new ErrorHandler("No products", 204));
                return;
            }

            convertPic(req, data);
            convertImg(req, data);
            await client?.setEx(`get_product_id${id}`, 120, JSON.stringify(data));

            res.send(data).status(200);
        } catch (e) {
            console.log(e);
            res.send(new ErrorHandler("Internal server error", 500));
        }
    },
    GETCHEAP_id: async (req: Request, res: Response): Promise<void> => {
        try {
            const {page, limit} = req.query as any;
            const skipping = page * limit;
            const {id} = req.params;

            const client = await Client();
            const cache = await client?.get(`get_cheap_p${page}_l${limit}`);
            if (cache) {
                res.send(JSON.parse(cache));
                return;
            }
            const existing = await dataSource
                .getRepository(CategoriesEntity)
                .findOne({
                    where: {
                        id,
                    },
                });

            if (!existing) {
                res.send(new ErrorHandler("Wrong category id", 400));
                return;
            }
            const data = await dataSource.getRepository(ProductsEntity).find({
                order: {
                    price: "ASC",
                },
                where: {category: {id}},
                skip: skipping ? skipping : 0,
                take: limit ? limit : 10,
                relations: {
                    category: true,
                    orders: true,
                },
            });
            if (data) {
                convertImg(req, data);
                await client?.setEx(
                    `get_cheap_p${page}_l${limit}`,
                    15,
                    JSON.stringify(data)
                );
                res.send(data);
                return;
            }
            res.send(new ErrorHandler("No products", 204));
            return;
        } catch (e) {
            console.log(e);
            res.status(500).send(new ErrorHandler("Internal server error", 500));
        }
    },
    GETCHEAP: async (req: Request, res: Response): Promise<void> => {
        try {
            const {page, limit} = req.query as any;
            const skipping = page * limit;
            const client = await Client();
            const cache = await client?.get(`get_cheap`);

            if (cache) {
                res.send(JSON.parse(cache));
                return;
            }

            const data = await dataSource.getRepository(ProductsEntity).find({
                order: {
                    price: "ASC",
                },
                skip: skipping ? skipping : 0,
                take: limit ? limit : 10,
                relations: {
                    category: true,
                    orders: true,
                },
            });
            if (data) {
                convertImg(req, data);
                await client?.setEx(`get_cheap`, 15, JSON.stringify(data));
                res.send(data);
                return;
            }
        } catch (e) {
            console.log(e);
            res.status(500).send(new ErrorHandler("Internal server error", 500));
        }
    },
    GETEXPENSIVE_id: async (req: Request, res: Response): Promise<void> => {
        try {
            const {page, limit} = req.query as any;
            const skipping = page * limit;
            const {id} = req.params;

            const client = await Client();
            const cache = await client?.get(`get_cheap_p${page}_l${limit}`);
            if (cache) {
                res.send(JSON.parse(cache));
                return;
            }
            const existing = await dataSource
                .getRepository(CategoriesEntity)
                .findOne({
                    where: {
                        id,
                    },
                });

            if (!existing) {
                res.send(new ErrorHandler("Wrong category id", 400));
                return;
            }
            const data = await dataSource.getRepository(ProductsEntity).find({
                order: {
                    price: "DESC",
                },
                where: {category: {id}},
                skip: skipping ? skipping : 0,
                take: limit ? limit : 10,
                relations: {
                    category: true,
                    orders: true,
                },
            });
            if (data) {
                convertImg(req, data);
                await client?.setEx(
                    `get_cheap_p${page}_l${limit}`,
                    15,
                    JSON.stringify(data)
                );
                res.send(data).status(200);
                return;
            }
            res.send(new ErrorHandler("No products", 204));
            return;
        } catch (e) {
            console.log(e);
            res.status(500).send(new ErrorHandler("Internal server error", 500));
        }
    },
    GETEXPENSIVE: async (req: Request, res: Response): Promise<void> => {
        try {
            const {page, limit} = req.query as any;
            const skipping = page * limit;

            const client = await Client();
            const cache = await client?.get(`get_expensive_p${page}_l${limit}`);

            if (cache) {
                res.send(JSON.parse(cache));
                return;
            }
            const data = await dataSource.getRepository(ProductsEntity).find({
                order: {
                    price: "DESC",
                },
                skip: skipping ? skipping : 0,
                take: limit ? limit : 10,
                relations: {
                    category: true,
                    orders: true,
                },
            });

            if (data) {
                convertImg(req, data);
                await client?.setEx(
                    `get_expensive_p${page}_l${limit}`,
                    15,
                    JSON.stringify(data)
                );
                res.send(data).status(200);
                return;
            }
            res.send(new ErrorHandler("No products", 204));
            return;

        } catch (e) {
            console.log(e);
            res.status(500).send(new ErrorHandler("Internal server error", 500));
        }
    },
    MAKEDISCOUNT: async (req: Request, res: Response): Promise<void> => {
        const {id} = req.params;
        const {persent} = req.body;
        try {
            if (persent > 1 && persent <= 99) {
                const existingProduct = await dataSource
                    .getRepository(ProductsEntity)
                    .findOne({
                        where: {id},
                    });
                if (!existingProduct) {
                    res.send(new ErrorHandler("product not found", 404));
                    return;
                }

                await dataSource
                    .getRepository(ProductsEntity)
                    .createQueryBuilder()
                    .update(ProductsEntity)
                    .set({
                        discountPersent: persent,
                        discountprice:
                            existingProduct.price - (existingProduct.price * persent) / 100,
                    })
                    .where({
                        id,
                    })
                    .execute();
                res.status(200).json({message: "Successful"});
                return;
            }
            res.send(new ErrorHandler("Persent value must be from 1 to 100", 402));
        } catch (err: unknown) {
            res.send(new ErrorHandler("Internal, server error", 500));
        }
    },
    GETDISCOUNTS: async (req: Request, res: Response): Promise<void> => {
        const {page, limit} = req.query as any;
        const skipping = page * limit;

        const client = await Client();
        const cache = await client?.get(`get_discounts_p${page}_l${limit}`);
        if (cache) {
            res.send(JSON.parse(cache));
            return;
        }
        const data = await dataSource.getRepository(ProductsEntity).find({
            order: {
                discountPersent: "ASC",
            },
            where: {
                discountPersent: Between(1, 99),
            },
            skip: skipping ? skipping : 0,
            take: limit ? limit : 10,
            relations: {
                orders: true,
            },
        });

        if (!data) {
            res.send(new ErrorHandler("products not found", 404));
            return;
        }
        convertImg(req, data);
        await client?.setEx(
            `get_discounts_p${page}_l${limit}`,
            15,
            JSON.stringify(data)
        );
        res.status(200).json(data);
    },
    MYPRODUCTS: async (req: Request, res: Response): Promise<void> => {
        try {
            const client = await Client();
            const cache = await client?.get(`get_my_products`);
            if (cache) {
                res.send(JSON.parse(cache));
                return;
            }

            const {user_id} = req.headers
            const existing = await dataSource.getRepository(UserEntity).findOne({
                where: {
                    id: user_id as string,
                },
                select: {
                    products: {
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
                        image: true,
                    },
                },
                relations: {
                    products: true,
                },
            });

            if (existing) {
                console.log(2222)
                convertImg(req, existing.products);
                await client?.setEx(
                    `get_my_products`,
                    15,
                    JSON.stringify(existing.products)
                );
                res.status(200).send(existing.products);
                return;
            }
            res.send('not ok')
            return
        } catch (err: unknown) {
            res.status(500).send(new ErrorHandler("Internal server error", 500));
            return;
        }
    },
    ONEMYPRODUCT: async (req: Request, res: Response): Promise<void> => {
        try {
            const {user_id} = req.headers;
            const {id} = req.params;

            const client = await Client();
            const cache = await client?.get(`get_my_product_${id}`);
            if (cache) {
                res.send(JSON.parse(cache));
                return;
            }

            const existing = await dataSource.getRepository(ProductsEntity).find({
                relations: {
                    user_id: true,
                    orders: true,
                    pictures: true,
                },
                select: {
                    user_id: {
                        id: true,
                    },
                },
                where: {
                    id,
                    user_id: {
                        id: user_id as string,
                    },
                },
            });

            if (existing && existing.length !== 0) {
                convertImg(req, existing);
                convertPic(req, existing);

                await client?.setEx(
                    `get_my_product_${id}`,
                    50,
                    JSON.stringify(existing)
                );
                res.status(200).send(existing);
                return;
            }

        } catch (err: unknown) {
            console.log(err);
            res.send(new ErrorHandler("Internal server error", 500));
            return;
        }
    },
    SEARCH: async (req: Request, res: Response): Promise<void> => {
        const {title} = req.body;

        try {
            if (title.length >= 2) {
                const data = await dataSource.getRepository(ProductsEntity).findBy({
                    title: ILike("%" + title + "%"),
                });
                if (!data) {
                    res.send(new ErrorHandler("Products not found", 404));
                    return;
                }

                // data.map((e) => {
                //   let rate = 0
                //   let order_counts = 0
                //   e.stars.map((k) => {
                //     rate += k.star
                //   })

                //   e.orders.map((k) => {
                //     order_counts += k.count
                //   })
                //   e.rating = Number((rate / e.stars.length)?.toFixed(2))
                //   e.orders_count = Number((order_counts / e.orders.length)?.toFixed(2))
                // })
                res.status(200).json(data);
                return;
            } else {
                res.send(new ErrorHandler("Too short character, must > 2", 400));
                return;
            }
        } catch (err: unknown) {
            res.send(new ErrorHandler("Internal server error", 500));
        }
    },
};
