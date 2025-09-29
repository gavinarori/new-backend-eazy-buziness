import mongoose, { Schema, Document, Model } from 'mongoose';

export type ShopStatus = 'pending' | 'approved' | 'rejected';

export interface ShopDocument extends Document {
  name: string;
  description?: string;
  ownerId: mongoose.Types.ObjectId; // User with role seller/admin
  status: ShopStatus;
  approvedBy?: mongoose.Types.ObjectId | null;
  approvedAt?: Date | null;
}

const shopSchema = new Schema<ShopDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    approvedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Shop: Model<ShopDocument> = mongoose.model<ShopDocument>('Shop', shopSchema);


