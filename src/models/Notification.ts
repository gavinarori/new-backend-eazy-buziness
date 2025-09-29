import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationType = 'shop_pending' | 'shop_approved' | 'order_created' | 'order_status' | 'inventory_low';

export interface NotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message?: string;
  read: boolean;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Notification: Model<NotificationDocument> = mongoose.model<NotificationDocument>('Notification', notificationSchema);


