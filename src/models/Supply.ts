import mongoose, { Schema, Document, Model } from 'mongoose';

export interface SupplyDocument extends Document {
  shopId: mongoose.Types.ObjectId;
  supplierName: string;
  items: Array<{
    productId: mongoose.Types.ObjectId;
    quantity: number;
    unitCost: number;
  }>;
  totalCost: number;
  receivedAt: Date;
}

const supplySchema = new Schema<SupplyDocument>(
  {
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    supplierName: { type: String, required: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitCost: { type: Number, required: true, min: 0 },
      },
    ],
    totalCost: { type: Number, required: true, min: 0 },
    receivedAt: { type: Date, required: true },
  },
  { timestamps: true },
);

export const Supply: Model<SupplyDocument> = mongoose.model<SupplyDocument>('Supply', supplySchema);


