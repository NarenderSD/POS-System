import mongoose, { Schema, models, model } from 'mongoose'

const ProductSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  isVeg: { type: Boolean, default: true },
  available: { type: Boolean, default: true },
  tags: [{ type: String }],
}, { timestamps: true })

export const Product = models.Product || model('Product', ProductSchema) 