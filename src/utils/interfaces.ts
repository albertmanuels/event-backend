import { Request } from "express";
import { Types } from "mongoose"

export interface User {
  fullName: string;
  username: string
  email: string
  password: string
  role: string
  profilePicture: string
  isActive: boolean
  activationCode: string
  createdAt?: string
}

export interface IUserToken extends Omit<User, 
"password" 
| "activationCode" 
| "isActive" 
| "email" 
| "fullName" 
| "profilePicture" 
| "username"
> {
  id?: Types.ObjectId
}

export interface IReqUser extends Request {
  user?: IUserToken
}

export interface IPaginationQuery {
  page: number,
  limit: number,
  search?: string
}