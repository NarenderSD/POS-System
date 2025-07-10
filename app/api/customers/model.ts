import mongoose, { Schema, models, model } from 'mongoose'

const CustomerSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  loyaltyPoints: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastVisit: { type: Date },
  preferences: [{ type: String }],
  allergies: [{ type: String }],
  favoriteItems: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  address: { type: String },
  birthday: { type: Date },
  membershipTier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
}, { timestamps: true })

export const Customer = models.Customer || model('Customer', CustomerSchema) 