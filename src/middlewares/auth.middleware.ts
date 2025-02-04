import { NextFunction, Request, Response } from "express";
import { getUserData } from "../utils/jwt";
import { IReqUser } from "../utils/interfaces";
import response from "../utils/response";

export default (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers?.authorization;

  if(!authorization) {
    response.unauthorized(res)
    return
  }

  const [prefix, token] = authorization.split(" ")

  if(!(prefix === "Bearer" && token)) {
    response.unauthorized(res)
    return
  }

  const user = getUserData(token)

  if(!user) {
    response.unauthorized(res)
    return
  }

  // Casting
  (req as IReqUser).user = user

  next()
}