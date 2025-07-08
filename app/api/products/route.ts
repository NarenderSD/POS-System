import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Product } from './model'
import { uploadImageToCloudinary } from '@/lib/cloudinary'

export async function GET() {
  await connectToDatabase()
  const products = await Product.find().sort({ createdAt: -1 })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  await connectToDatabase()
  const data = await req.json()
  let imageUrl = data.image
  if (data.image && data.image.startsWith('data:image')) {
    // base64 image, upload to Cloudinary
    const upload = await uploadImageToCloudinary(data.image)
    imageUrl = upload.url
  }
  const product = await Product.create({ ...data, image: imageUrl })
  return NextResponse.json(product, { status: 201 })
}

export async function PUT(req: NextRequest) {
  await connectToDatabase()
  const data = await req.json()
  const { _id, ...update } = data
  let imageUrl = update.image
  if (update.image && update.image.startsWith('data:image')) {
    const upload = await uploadImageToCloudinary(update.image)
    imageUrl = upload.url
  }
  const product = await Product.findByIdAndUpdate(_id, { ...update, image: imageUrl }, { new: true })
  return NextResponse.json(product)
}

export async function DELETE(req: NextRequest) {
  await connectToDatabase()
  const { _id } = await req.json()
  await Product.findByIdAndDelete(_id)
  return NextResponse.json({ success: true })
} 