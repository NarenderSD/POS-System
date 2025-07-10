import mongoose, { Schema, models, model } from 'mongoose'

const WaiterSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String },
  staffId: { type: Schema.Types.ObjectId, ref: 'Staff' },
  totalOrders: { type: Number, default: 0 },
  orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

export const Waiter = models.Waiter || model('Waiter', WaiterSchema) 