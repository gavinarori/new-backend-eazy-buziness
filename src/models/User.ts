import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'customer' | 'seller' | 'admin' | 'superadmin';

export interface UserDocument extends Document {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  shopId?: mongoose.Types.ObjectId | null;
  isActive: boolean;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['customer', 'seller', 'admin', 'superadmin'], default: 'customer' },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', default: null },
    isActive: { type: Boolean, default: true },
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


