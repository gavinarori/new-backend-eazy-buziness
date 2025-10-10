import 'dotenv/config';
import mongoose from 'mongoose';
import { connectToDatabase } from '../config/mongoose';
import { User } from '../models/User';

async function main() {
  const mongoUri = process.env.MONGO_URI as string;
  await connectToDatabase(mongoUri);

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@demo.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'shop123';
  const adminName = process.env.SEED_ADMIN_NAME || 'System Admin';

  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    console.log('Admin already exists:', adminEmail);
  } else {
    const user = await User.create({
      email: adminEmail,
      password: adminPassword,
      name: adminName,
      role: 'superadmin',
    });
    console.log('Admin created:', user.email);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});


