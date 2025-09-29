import mongoose, { Schema, Document, Model } from 'mongoose';

export interface SettingsDocument extends Document {
  shopId?: mongoose.Types.ObjectId | null;
  key: string;
  value: unknown;
}

const settingsSchema = new Schema<SettingsDocument>(
  {
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', default: null, index: true },
    key: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

settingsSchema.index({ shopId: 1, key: 1 }, { unique: true });

export const Settings: Model<SettingsDocument> = mongoose.model<SettingsDocument>('Settings', settingsSchema);


