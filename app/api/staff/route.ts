import { NextResponse } from 'next/server'
import { Staff } from './model'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  await connectToDatabase()
  const staff = await Staff.find({})
  return NextResponse.json(staff)
}

export async function POST(req) {
  await connectToDatabase()
  const data = await req.json()
  const staff = await Staff.create(data)
  return NextResponse.json(staff)
}

export async function PUT(req) {
  await connectToDatabase()
  const data = await req.json()
  const staff = await Staff.findByIdAndUpdate(data._id, data, { new: true })
  return NextResponse.json(staff)
}

export async function DELETE(req) {
  await connectToDatabase()
  const { id } = await req.json()
  await Staff.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
} 