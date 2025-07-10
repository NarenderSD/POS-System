import mongoose, { Schema, models, model } from 'mongoose'

const OrderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  price: Number,
  quantity: Number,
  notes: String,
})

const OrderSchema = new Schema({
  tableNumber: { type: String },
  items: [OrderItemSchema],
  subtotal: Number,
  tax: Number,
  serviceCharge: Number,
  total: Number,
  status: { type: String, default: 'pending' },
  paymentMethod: String,
  paymentStatus: { type: String, default: 'pending' },
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  specialInstructions: String,
  waiterAssigned: { type: Schema.Types.ObjectId, ref: 'Waiter' },
  waiterName: String,
  loyaltyPointsUsed: { type: Number, default: 0 },
  loyaltyPointsEarned: { type: Number, default: 0 },
  billNumber: { type: String, unique: true },
}, { timestamps: true })

export const Order = models.Order || model('Order', OrderSchema) 