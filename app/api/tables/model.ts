import mongoose, { Schema, models, model } from 'mongoose'

const TableSchema = new Schema({
  number: { type: String, required: true, unique: true },
  status: { type: String, enum: ['available', 'occupied', 'reserved', 'cleaning', 'out_of_order'], default: 'available' },
  capacity: { type: Number, required: true },
  currentOrder: { type: Schema.Types.ObjectId, ref: 'Order' },
  customerName: { type: String },
  reservationTime: { type: Date },
  lastCleaned: { type: Date },
}, { timestamps: true })

export const Table = models.Table || model('Table', TableSchema) 