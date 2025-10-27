import { v2 as cloudinary } from 'cloudinary';

export function configureCloudinary() {
  console.log('🔍 Cloudinary ENV:', {
    name: process.env.CLOUDINARY_CLOUD_NAME,
    key: process.env.CLOUDINARY_API_KEY ? '✅ Loaded' : '❌ Missing',
    secret: process.env.CLOUDINARY_API_SECRET ? '✅ Loaded' : '❌ Missing',
  });

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export { cloudinary };
