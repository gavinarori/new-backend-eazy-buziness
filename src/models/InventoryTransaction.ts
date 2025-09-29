import mongoose, { Schema, Document, Model } from 'mongoose';

export type InventoryTxnType = 'adjustment_in' | 'adjustment_out' | 'sale' | 'supply';

export interface InventoryTransactionDocument extends Document {
  shopId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  type: InventoryTxnType;
  quantity: number;
  note?: string;
}

const inventoryTxnSchema = new Schema<InventoryTransactionDocument>(
  {
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    type: { type: String, enum: ['adjustment_in', 'adjustment_out', 'sale', 'supply'], required: true },
    quantity: { type: Number, required: true },
    note: { type: String },
  },
  { timestamps: true },
);

export const InventoryTransaction: Model<InventoryTransactionDocument> = mongoose.model<InventoryTransactionDocument>('InventoryTransaction', inventoryTxnSchema);


