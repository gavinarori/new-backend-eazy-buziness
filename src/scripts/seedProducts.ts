import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../models/Product';

// Load env variables (make sure MONGO_URI is defined in .env)
dotenv.config();

async function seedProducts() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('Missing MONGO_URI in environment');
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Optionally clear existing products
    await Product.deleteMany({});
    console.log('🧹 Cleared existing products');



    // Define some sample products
    const sampleProducts = [
      {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with 2.4GHz connectivity.',
        price: 1200,
        cost: 700,
        stock: 40,
        minStock: 5,
        shopId :"68e4d1f5f23d91fcce219d39",
        categoryId: '68ee302b70379b3c32536950',
        sku: 'WM123',
        barcode: 'EZ123456789001',
        images: [
          { url: 'https://m.media-amazon.com/images/I/61rxUy+ubdL._AC_SL1500_.jpg', publicId: 'placeholder/wireless-mouse' },
        ],
      },
      {
        name: 'Mechanical Keyboard',
        description: 'RGB backlit mechanical keyboard, brown switches.',
        price: 6500,
        cost: 4000,
        stock: 25,
        minStock: 3,
        shopId :"68e4d1f5f23d91fcce219d39",
        categoryId: '68ee302b70379b3c32536950',
        sku: 'MK456',
        barcode: 'EZ123456789002',
        images: [
          { url: 'https://m.media-amazon.com/images/I/61++ok6AqtL._AC_SL1500_.jpg', publicId: 'placeholder/keyboard' },
        ],
      },
      {
        name: 'USB-C Charger 45W',
        description: 'Fast-charging USB-C wall adapter with smart IC.',
        price: 2500,
        cost: 1200,
        stock: 60,
        minStock: 10,
        shopId :"68e4d1f5f23d91fcce219d39",
        categoryId: '68ee302b70379b3c32536950',
        sku: 'UC789',
        barcode: 'EZ123456789003',
        images: [
          { url: 'https://m.media-amazon.com/images/I/61++ok6AqtL._AC_SL1500_.jpg', publicId: 'placeholder/charger' },
        ],
      },
    ];

    // Insert into DB
    await Product.insertMany(sampleProducts);
    console.log(`🌱 Seeded ${sampleProducts.length} products`);

  } catch (err) {
    console.error('❌ Error seeding products:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedProducts();
