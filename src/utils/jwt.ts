import jwt from "jsonwebtoken";
import dotev from 'dotenv'
dotev.config()

// export const sign = (payload: string) => jwt.sign(payload, process.env.SECRET_KEY as string)

// export const verify = (payload: string) => jwt.verify(payload, process.env.SECRET_KEY as string)
// const key: string | undefined = process.env.SECRET_KEY

export default {
  sign:(payload : any) => jwt.sign( payload,  '1q2w3e4r', {expiresIn : 500}),
  verify:(payload: string) => jwt.verify(payload, process.env.SECRET_KEY as string)
}