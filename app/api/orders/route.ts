import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Order } from './model'

export async function GET(req: NextRequest) {
  await connectToDatabase()
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (id) {
    const order = await Order.findById(id)
    return NextResponse.json(order)
  }
  const orders = await Order.find().sort({ createdAt: -1 })
  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  await connectToDatabase()
  const data = await req.json()
  const order = await Order.create(data)
  return NextResponse.json(order, { status: 201 })
}

export async function PUT(req: NextRequest) {
  await connectToDatabase()
  const data = await req.json()
  const { _id, ...update } = data
  const order = await Order.findByIdAndUpdate(_id, update, { new: true })
  return NextResponse.json(order)
}

export async function DELETE(req: NextRequest) {
  await connectToDatabase()
  const { _id } = await req.json()
  await Order.findByIdAndDelete(_id)
  return NextResponse.json({ success: true })
} 