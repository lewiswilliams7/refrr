import mongoose, { Document, Schema } from 'mongoose';
import { Business } from './business.model';

export interface ICustomer extends Document {
  businessId: mongoose.Types.ObjectId;
  business?: Business;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: String,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, {
  timestamps: true
});

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema); 