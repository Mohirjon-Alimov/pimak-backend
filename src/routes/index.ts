import {Router} from "express";
import categories from "../controller/categories";
import orders from "../controller/orders";
import products from "../controller/products";
import users from "../controller/users";
import validationMiddleware from "../middlewares/validation.middleware";
import {userCreate} from "../validation/validate";
import pictures from "../controller/pictures";
import picture from "../middlewares/picture";
import {CheckToken} from "../middlewares/checkToken";
import {CheckForAdmin} from "../middlewares/checkForAdmin";

const router = Router();

export default router
    .post("/user/register", validationMiddleware(userCreate), users.REGISTER)
    .post("/user/add_phone", users.NEW_PHONE_NUM)
    .post("/user/login", users.LOGIN)
    .post("/user/delete", users.DELETEACCOUNT)

    .post("/category/create", CheckForAdmin, categories.CREATE)
    // .get("/categories/getall", categories.GETALL)
    .get("/categories/get", categories.GETONLY)
    .post("/category/update", CheckForAdmin, categories.UPDATE)
    .post("/category/delete", CheckForAdmin, categories.DELETE)

    .get("/products/count", products.GETCOUNT)
    .get("/products/get", products.GETALL) /** ok */
    .get("/products/get/:id", products.GET) /** id => category id */
    // .get("/products/get/top/:id", products.GETTOP) /**id => category id  */
    .get("/products/cheap", products.GETCHEAP)
    .get("/products/get/cheap/:id", products.GETCHEAP_id) /**id => category id  */
    .get("/products/get/expensive/:id", products.GETEXPENSIVE_id) /**id => category id  */
    .get("/products/expensive", products.GETEXPENSIVE)
    .get("/products/get/one/:id", products.GETBYID) /**id => product id  */
    .get("/products/discounts", products.GETDISCOUNTS) /**ok */
    .get("/products/getmyproducts", CheckForAdmin, products.MYPRODUCTS) /** only for admin */
    .get("/product/onemyproduct/:id", CheckForAdmin, products.ONEMYPRODUCT)/** only for admin */

    .post("/product/create", CheckForAdmin, picture.create, products.CREATE) /**ok */
    .post("/product/update/:id", CheckForAdmin, picture.update, products.UPDATE)/** id => product_id */
    .post("/product/delete/:id", CheckForAdmin, products.DELETE) /**id => product_id */
    .post("/product/makediscount/:id", CheckForAdmin, products.MAKEDISCOUNT) /**id => product_id */
    .post("/product/search", products.SEARCH)

    .get("/orders/get", CheckToken, orders.GET)
    .post("/orders/create", CheckToken, orders.CREATE)
    .post("/orders/delete/:id", CheckToken, orders.DELETE)

    // .get("/pictures", pictures.GET)
    // .get("/picture/:id", pictures.GETBYID)
    .get("/pictures/:id", pictures.GETBYPRODUCT)
    .post("/picture/delete/:id", CheckForAdmin, pictures.DELETE);
