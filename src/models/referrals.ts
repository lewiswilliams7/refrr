import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  referrerEmail: {
    type: String,
    required: true
  },
  referredEmail: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  code: {
    type: String,
    required: true,
    unique: true
  }
}, { timestamps: true });

export default mongoose.model('Referral', referralSchema);