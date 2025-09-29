import mongoose, { Schema, Document, Model } from 'mongoose';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceDocument extends Document {
  shopId: mongoose.Types.ObjectId;
  customerName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  dueDate?: Date | null;
  status: 'draft' | 'sent' | 'paid' | 'void';
}

const invoiceSchema = new Schema<InvoiceDocument>(
  {
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    customerName: { type: String, required: true },
    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
      },
    ],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    dueDate: { type: Date, default: null },
    status: { type: String, enum: ['draft', 'sent', 'paid', 'void'], default: 'draft' },
  },
  { timestamps: true },
);

export const Invoice: Model<InvoiceDocument> = mongoose.model<InvoiceDocument>('Invoice', invoiceSchema);


