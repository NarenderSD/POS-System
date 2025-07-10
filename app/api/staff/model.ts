import mongoose, { Schema, models, model } from 'mongoose'

const StaffSchema = new Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ['manager', 'cashier', 'waiter', 'kitchen'], required: true },
  phone: { type: String },
  shift: { type: String },
  permissions: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

export const Staff = models.Staff || model('Staff', StaffSchema) 