
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface CategoryDocument extends Document {
  name: string;
  slug: string;
  shopId: mongoose.Types.ObjectId;
}

const categorySchema = new Schema<CategoryDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, lowercase: true },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true }, 
  },
  { timestamps: true }
);

categorySchema.index({ shopId: 1, name: 1 }, { unique: true });
categorySchema.index({ shopId: 1, slug: 1 }, { unique: true });

export const Category: Model<CategoryDocument> =
  mongoose.model<CategoryDocument>('Category', categorySchema);
