import mongoose, { Schema, Document, Model } from 'mongoose';

export interface CategoryDocument extends Document {
  name: string;
  slug: string;
}

const categorySchema = new Schema<CategoryDocument>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
  },
  { timestamps: true },
);

export const Category: Model<CategoryDocument> = mongoose.model<CategoryDocument>('Category', categorySchema);


