import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ReviewDocument extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  rating: number; // 1-5
  comment?: string;
}

const reviewSchema = new Schema<ReviewDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
  },
  { timestamps: true },
);

reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const Review: Model<ReviewDocument> = mongoose.model<ReviewDocument>('Review', reviewSchema);


