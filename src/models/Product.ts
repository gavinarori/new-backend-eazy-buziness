import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ProductImage {
  url: string;
  publicId: string;
}

export interface ProductDocument extends Document {
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price: number;
  stock: number;
  shopId: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId | null;
  images: ProductImage[];
  ratingAverage: number;
  ratingCount: number;
}

const productSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    sku: { type: String, index: true, unique: false },
    barcode: { type: String, index: true, unique: false },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Product: Model<ProductDocument> = mongoose.model<ProductDocument>('Product', productSchema);


