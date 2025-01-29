
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
  password: Yup.string().required()
    .min(6, "Password must be at least 6 characters")
    .test('at-least-one-uppercase-letter', "Contains at least one uppercase letter", 
      (value) => {
        if(!value) return false

        const regex = /^(?=.*[A-Z])/

        return regex.test(value)
      }
    )
    .test('at-least-one-number', "Contains at least one number", 
      (value) => {
        if(!value) return false

        const regex = /^(?=.*\d)/

        return regex.test(value)
      }
    ),
  confirmPassword: Yup.string().required().oneOf([Yup.ref("password"), ""], "Password not matched"),
})

export default {
  async register(req: Request, res: Response) {
    /**
     #swagger.tags = ["Auth"]
     #swagger.requestBody = {
     required: true,
     schema: {$ref: "#/components/schemas/RegisterRequest"}
     }
    */
    const {fullName, username, email, password, confirmPassword} = req.body as unknown as TRegister
  
    try {
      const result  = await UserModel.create({
        fullName,
        username,
        email,
        password,
      })

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
    /**
     #swagger.tags = ["Auth"]
     #swagger.requestBody = {
     required: true,
     schema: {$ref: "#/components/schemas/LoginRequest"}
     }
    */

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
          },
        ],
        isActive: true,
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
    /**
    #swagger.tags = ["Auth"]
    #swagger.security = [{
    "bearerAuth": []
    }]
    */
    
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
  },

  async activation(req: Request, res: Response) {
     /**
    #swagger.tags = ["Auth"]
    #swagger.requestBody = {
    required: true,
    schema: {$ref: "#/components/schemas/ActivationRequest"}
    }
    */
    try {
      const {code} = req.body as {code: string}

      const user = await UserModel.findOneAndUpdate(
        {
          activationCode: code,
        }, 
        {
          isActive: true, // value that updated
        }, 
        {
          new: true // if true, immediately updating value once the selected value is updated
        }
      )

      res.status(200).json({
        message: "User successfully activated",
        data: user
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