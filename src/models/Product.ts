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
  cost?: number;
  stock: number;
  minStock?: number;
  shopId: string;
  categoryId?: string | null;
  images: ProductImage[];
}

const productSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    sku: { type: String, index: true, unique: false },
    barcode: { type: String, index: true, unique: false },
    price: { type: Number, required: true, min: 0 },
    cost: { type: Number, default: 0, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    minStock: { type: Number, default: 0, min: 0 },
    shopId: { type: String, ref: 'Shop', required: true },
    categoryId: { type: String, ref: 'Category', default: null },
    images: [{ url: String, publicId: String }],
  },
  { timestamps: true },
);

export const Product: Model<ProductDocument> = mongoose.model<ProductDocument>('Product', productSchema);


