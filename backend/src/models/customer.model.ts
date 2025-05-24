import mongoose, { Document, Schema, Types } from 'mongoose';
import { IBusiness } from './business.model';

export interface ICustomer extends Document {
  userId: Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  businessId: Types.ObjectId;
  business?: IBusiness;
  status: 'active' | 'inactive';
  createdAt: Schema.Types.Date;
  updatedAt: Schema.Types.Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  { timestamps: true }
);

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema); 