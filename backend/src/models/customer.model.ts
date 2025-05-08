import mongoose, { Document, Schema, Types } from 'mongoose';
import { IBusiness } from './business.model';

export interface ICustomer extends Document {
  userId: Types.ObjectId;
  businessId: Types.ObjectId;
  business?: IBusiness;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  { timestamps: true }
);

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema); 