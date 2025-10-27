import mongoose, { Schema, Document, Model } from 'mongoose';

export interface SaleItem {
  productId?: mongoose.Types.ObjectId | null;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface SaleDocument extends Document {
  shopId: mongoose.Types.ObjectId;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'mobile' | 'bank_transfer';
  saleNumber?: string;
  createdBy: mongoose.Types.ObjectId;
}

const saleItemSchema = new Schema<SaleItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: false, default: null },
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const saleSchema = new Schema<SaleDocument>(
  {
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    customerName: { type: String, required: true },
    items: [saleItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentMethod: { 
      type: String, 
      enum: ['cash', 'card', 'mobile', 'bank_transfer'], 
      required: true 
    },
    saleNumber: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true },
);

// Auto-generate incremental sale number
saleSchema.pre('save', async function (next) {
  if (!this.saleNumber) {
    const count = await this.constructor.countDocuments();
    this.saleNumber = `SALE-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export const Sale: Model<SaleDocument> = mongoose.model<SaleDocument>('Sale', saleSchema);
