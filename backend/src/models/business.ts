import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IBusiness extends Document {
  _id: mongoose.Types.ObjectId;
  businessName: string;
  businessType: string;
  email: string;
  password: string;
  location: {
    address: string;
    city: string;
    postcode: string;
  };
}

const businessSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true
  },
  businessType: {
    type: String,
    required: true,
    enum: ['barber', 'sunbed', 'salon', 'spa', 'other']
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    postcode: {
      type: String,
      required: true
    }
  }
}, { timestamps: true });

businessSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Business = mongoose.model<IBusiness>('Business', businessSchema);
export default Business;