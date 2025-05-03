import mongoose from 'mongoose';

export interface IReferral extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  referrerEmail?: string;
  code?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

const referralSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  referrerEmail: {
    type: String,
    required: false
  },
  code: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  completedAt: {
    type: Date
  }
}, { timestamps: true });

// Add virtual population for campaign details
referralSchema.virtual('campaign', {
  ref: 'Campaign',
  localField: 'campaignId',
  foreignField: '_id',
  justOne: true
});

// Add virtual population for business details
referralSchema.virtual('business', {
  ref: 'User',
  localField: 'businessId',
  foreignField: '_id',
  justOne: true
});

const Referral = mongoose.model<IReferral>('Referral', referralSchema);
export { Referral };
export default Referral;