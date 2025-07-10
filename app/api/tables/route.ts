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
  const table = await Table.create(data)
  return NextResponse.json(table)
}

export async function PUT(req) {
  await connectToDatabase()
  const data = await req.json()
  const table = await Table.findByIdAndUpdate(data._id, data, { new: true })
  return NextResponse.json(table)
}

export async function DELETE(req) {
  await connectToDatabase()
  const { id } = await req.json()
  await Table.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
} 