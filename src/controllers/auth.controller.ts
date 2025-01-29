
import * as Yup from "yup"
import UserModel from "../models/user.model"
import { encrypt } from "../utils/encryption"
import { Request, Response } from "express"
import { generateToken } from "../utils/jwt"
import { IReqUser } from "../middlewares/auth.middleware"

type TRegister = {
  fullName: string
  username: string
  email: string
  password: string
  confirmPassword: string
}

type TLogin = {
  identifier: string
  password: string,
}

const registerValidateSchema  = Yup.object({
  fullName: Yup.string().required(),
  username: Yup.string().required(),
  email: Yup.string().email().required(),
  password: Yup.string().required(),
  confirmPassword: Yup.string().required().oneOf([Yup.ref("password"), ""], "Password not matched"),
})

export default {
  async register(req: Request, res: Response) {
    const {fullName, username, email, password, confirmPassword} = req.body as unknown as TRegister
  
    const result  = await UserModel.create({
      fullName,
      username,
      email,
      password,
    })
  
    try {
      await registerValidateSchema.validate({
        fullName,
        username,
        email,
        password,
        confirmPassword
      })
  
      res.status(200).json({
        message: "Success registration!",
        data: result
      })
  
    } catch (error) {
      const err = error as unknown as Error
      
      res.status(400).json({
        message: err.message,
        data: null
      })
    }
  },
  
  async login(req: Request, res: Response) {
    try {
      // get user data based on "identifier" -> email and username
      const {identifier, password} = req.body as unknown as TLogin
  
      const userByIdentifier = await UserModel.findOne({
        $or: [
          {
          email: identifier
        },
        {
          username: identifier
        }
      ]
      })
  
      if(!userByIdentifier) {
        res.status(403).json({
          message: "User not found!",
          data: null
        })
  
        return
      }
  
      // validate password
      const validatePassword: boolean = encrypt(password) === userByIdentifier.password
  
      if(!validatePassword) {
        res.status(403).json({
          message: "User not found!",
          data: null
        })
  
        return
      }

      const token = generateToken({
        id: userByIdentifier._id,
        role: userByIdentifier.role
      })
  
      res.status(200).json({
        message: "Login success!",
        data: token
      })
  
    } catch (error) {
      const err = error as unknown as Error
      
      res.status(400).json({
        message: err.message,
        data: null
      })
    }
  },

  // Checking if the token is exist in db and will return user data based on the matched token
  async me(req: IReqUser, res: Response) {
    try {
      const user = req.user
      const result = await UserModel.findById(user?.id)

      res.status(200).json({
        message: "Success get user profile",
        data: result
      })

    } catch (error) {
      const err = error as unknown as Error
      
      res.status(400).json({
        message: err.message,
        data: null
      })
    }
  }
}