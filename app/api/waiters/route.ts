import { NextResponse } from 'next/server'
import { Waiter } from './model'
import { Order } from '../orders/model'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  await connectToDatabase()
  // Aggregate order count for each waiter
  const waiters = await Waiter.find({})
  const orders = await Order.find({})
  const waiterOrderCounts = waiters.map(w => {
    const count = orders.filter(o => o.waiterAssigned?.toString() === w._id.toString()).length
    return { ...w.toObject(), totalOrders: count }
  })
  return NextResponse.json(waiterOrderCounts)
}

export async function POST(req) {
  await connectToDatabase()
  const data = await req.json()
  const waiter = await Waiter.create(data)
  return NextResponse.json(waiter)
}

export async function PUT(req) {
  await connectToDatabase()
  const data = await req.json()
  const waiter = await Waiter.findByIdAndUpdate(data._id, data, { new: true })
  return NextResponse.json(waiter)
}

export async function DELETE(req) {
  await connectToDatabase()
  const { id } = await req.json()
  await Waiter.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
} 