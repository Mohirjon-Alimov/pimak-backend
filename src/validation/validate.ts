import Joi from "joi"

export const userCreate = Joi.object({
  username: Joi.string().min(2).max(44).required(),
  password: Joi.string().min(2).max(20).required(),
})
