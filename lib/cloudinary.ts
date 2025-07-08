import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImageToCloudinary(base64: string) {
  // Remove data:image/...;base64, prefix if present
  const matches = base64.match(/^data:(.+);base64,(.+)$/)
  const data = matches ? matches[2] : base64
  return new Promise<{ url: string }>((resolve, reject) => {
    cloudinary.uploader.upload(
      `data:image/png;base64,${data}`,
      { folder: 'pos-products' },
      (error, result) => {
        if (error || !result) return reject(error)
        resolve({ url: result.secure_url })
      }
    )
  })
} 