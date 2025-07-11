import { NextResponse } from 'next/server'
import { Table } from './model'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  await connectToDatabase()
  const tables = await Table.find({})
  return NextResponse.json(tables)
}

export async function POST(req) {
  await connectToDatabase()
  const data = await req.json()
  // Always sanitize new table data
  const sanitized = {
    ...data,
    currentOrder: undefined,
    customerName: undefined,
    reservationTime: undefined,
    waiterAssigned: undefined,
  }
  const table = await Table.create(sanitized)
  return NextResponse.json(table)
}

export async function PUT(req) {
  await connectToDatabase()
  const data = await req.json()
  let update = { ...data }
  // Always blank table if status is 'available' or currentOrder is not set
  if (data.status === 'available' || !data.currentOrder) {
    update.status = 'available'
    update.currentOrder = null
    update.customerName = undefined
    update.reservationTime = undefined
    update.waiterAssigned = undefined
  }
  const table = await Table.findByIdAndUpdate(data._id, update, { new: true })
  return NextResponse.json(table)
}

export async function DELETE(req) {
  await connectToDatabase()
  const { id } = await req.json()
  await Table.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
} 