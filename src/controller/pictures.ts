import {Request, Response} from "express";
import {AppDataSource} from "../config/ormconfig";
import {PicturesEntity} from "../entities/picture.entity";
import {Client} from "../config/redis";

const convertPic = (req: Request, data: any): any => {
  const protocol = req.protocol;
  const host = req.hostname;
  const port = process.env.PORT;
  const fullUrl = `${protocol}://${host}:${port}`;

  return data.forEach((k: any) => {
    k.pic = `${fullUrl}/uploads/${k.pic}`;
  });
};

export default {
  // GET: async (req: Request, res: Response) => {
  //   try {
  //     const { page, limit } = req.query as any;
  //     const skipping = page * limit;
  //     const pictures = await AppDataSource.getRepository(PicturesEntity).find({
  //       skip: skipping ? skipping : 0,
  //       take: limit ? limit : 10,
  //       relations:{
  //         product:true
  //       }
  //     });

  //     convertPic(req, pictures);
  //     res.send(pictures);
  //   } catch (e) {
  //     console.log(e);
  //     res.status(500).send("some err");
  //   }
  // },
  // GETBYID: async (req: Request, res: Response) => {
  //   try {
  //     const { id } = req.params;

  //     const picture = await AppDataSource.getRepository(PicturesEntity).findOne(
  //       {
  //         where: { id },
  //       }
  //     );
  //     res.send(picture);
  //   } catch (e) {
  //     console.log(e);
  //     res.status(500).send("Internal server error");
  //   }
  // },
  GETBYPRODUCT: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const client = await Client();
      const cache = await client?.get(`${id}_pictures`);

      if (cache) {
        res.send(JSON.parse(cache));
        return;
      }

      const pictures = await AppDataSource.getRepository(PicturesEntity).find({
        where: {
          product: { id },
        },
      });
      convertPic(req, pictures);
      await client?.setEx(`${id}_pictures`, 20, JSON.stringify(pictures));
      res.send(pictures);
    } catch (e) {
      console.log(e);
      res.status(500).send("Internal server error");
    }
  },
  DELETE: async (req: Request, res: Response) => {
    try {
      // check token
    const { id } = req.params;

      const Picture = await AppDataSource.getRepository(
        PicturesEntity
      ).find({
        where: {
          product: {
            id
          },
        },
      });
      console.log(Picture);
      res.send('ok')
      
    } catch (e) {
      console.log(e);
      res.status(500).send("Internal server error");
    }
  },
};
