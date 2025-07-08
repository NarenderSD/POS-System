import mongoose, { Schema, models, model } from 'mongoose'

const OrderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  price: Number,
  quantity: Number,
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
}, { timestamps: true })

export const Order = models.Order || model('Order', OrderSchema) 