import {v2 as cloudinary} from "cloudinary"
import {CLOUDINARY_API_KEY, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_SECRET} from "./env"

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
})

const toDataURL = (file: Express.Multer.File) => {
  const b64 = Buffer.from(file.buffer).toString("base64")
  const dataURL = `data:${file.mimetype};base64,${b64}`

  return dataURL
}

const getPublicIdFromFileUrl = (fileUrl: string) => {
  const fileNameUsingSubString = fileUrl.substring(fileUrl.lastIndexOf("/") + 1)

  const publicId = fileNameUsingSubString.substring(0, fileNameUsingSubString.lastIndexOf("."))

  return publicId
}

export default {
  async uploadSingle(file: Express.Multer.File){
    const fileDataURL = toDataURL(file)
    const result = await cloudinary.uploader.upload(fileDataURL, {
      resource_type: "auto",
      folder: "event-app"
    })

    return result
  },

  async uploadMultiple(files: Express.Multer.File[]){
    const uploadBatch = files.map(file => {
      const result = this.uploadSingle(file) //refer to uploadSingle function
      return result
    })

    const results = await Promise.all(uploadBatch)
    return results
  },

  async remove(fileUrl: string){
    const publicId = getPublicIdFromFileUrl(fileUrl)
    const result = await cloudinary.uploader.destroy(publicId)

    return result
  }
}
