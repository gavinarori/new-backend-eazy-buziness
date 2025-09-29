import mongoose, { Schema, Document, Model } from 'mongoose';

export interface OrderItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  priceAtPurchase: number;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';

export interface OrderDocument extends Document {
  userId: mongoose.Types.ObjectId;
  shopId: mongoose.Types.ObjectId;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
}

const orderSchema = new Schema<OrderDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        priceAtPurchase: { type: Number, required: true, min: 0 },
      },
    ],
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'paid', 'shipped', 'completed', 'cancelled'], default: 'pending' },
  },
  { timestamps: true },
);

export const Order: Model<OrderDocument> = mongoose.model<OrderDocument>('Order', orderSchema);


