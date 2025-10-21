import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'customer' | 'seller' | 'admin' | 'superadmin' | 'staff';

export interface UserDocument extends Document {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  shopId?: mongoose.Types.ObjectId | null;
  isActive: boolean;
  phone?: string;
  permissions?: string[];
  salesTarget?: number;
  commissionRate?: number;
  createdBy?: mongoose.Types.ObjectId;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['customer', 'seller', 'admin', 'superadmin', 'staff'], default: 'customer' },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', default: null },
    isActive: { type: Boolean, default: true },
    phone: { type: String },
    permissions: [{ type: String }],
    salesTarget: { type: Number, default: 100 },
    commissionRate: { type: Number, default: 5 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  const user = this as UserDocument;
  if (!user.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User: Model<UserDocument> = mongoose.model<UserDocument>('User', userSchema);


