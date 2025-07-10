import { NextResponse } from 'next/server'
import { Customer } from './model'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  await connectToDatabase()
  const customers = await Customer.find({})
  return NextResponse.json(customers)
}

export async function POST(req) {
  await connectToDatabase()
  const data = await req.json()
  const customer = await Customer.create(data)
  return NextResponse.json(customer)
}

export async function PUT(req) {
  await connectToDatabase()
  const data = await req.json()
  const customer = await Customer.findByIdAndUpdate(data._id, data, { new: true })
  return NextResponse.json(customer)
}

export async function DELETE(req) {
  await connectToDatabase()
  const { id } = await req.json()
  await Customer.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
} 