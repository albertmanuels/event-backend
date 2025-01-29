import mongoose from "mongoose";
import { encrypt } from "../utils/encryption";
import { renderMailHtml, sendMail } from "../utils/mail/mails";
import { CLIENT_HOST, EMAIL_SMTP_USER } from "../utils/env";

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

const Schema = mongoose.Schema

const UserSchema = new Schema<User>({
  fullName: {
    type: Schema.Types.String,
    required: true
  },
  username: {
    type: Schema.Types.String,
    required: true,
    unique: true
  },
  email: {
    type: Schema.Types.String,
    required: true,
    unique: true
  },
  password: {
    type: Schema.Types.String,
    required: true
  },
  role: {
    type: Schema.Types.String,
    enum: ["admin", "user"],
    default: "user"
  },
  profilePicture: {
    type: Schema.Types.String,
    default: "user.jpg"
  },
  isActive: {
    type: Schema.Types.Boolean,
    default: false
  },
  activationCode: {
    type: Schema.Types.String,
  }
}, {
  timestamps: true
})

// pre is a middleware, which runs before the "save" action
UserSchema.pre("save", function (next) {
  const user = this;

  user.password = encrypt(user.password)
  user.activationCode = encrypt(user.id)

  next()
})

// post is a middleware, which runs before the "save" action.
// doc param holds the user data
UserSchema.post("save", async function(doc, next) {
  try {
    const user = doc

    console.log(`Send email to: ${user.email}`)
  
    const contentMail = await renderMailHtml("registration-success.ejs", {
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
      activationLink: `${CLIENT_HOST}/auth/activation?code=${user.activationCode}`
    })
  
    await sendMail({
      from: EMAIL_SMTP_USER,
      to: user.email,
      subject: "Activation Account",
      html: contentMail
    })

  } catch (error) {
    console.log(error)
  } finally {
    next()
  }
})

// delete password from returned User data
UserSchema.methods.toJSON = function() {
  const user = this.toObject()

  delete user.password

  return user
}

const UserModel = mongoose.model("User", UserSchema)

export default UserModel
