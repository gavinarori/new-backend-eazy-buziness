# Easybizness Backend (MERN)

TypeScript Node.js backend for Easybizness with MongoDB and Cloudinary.

## Setup

1. Copy `.env.example` to `.env` and fill values.
2. Run `npm install`.
3. Start dev server: `npm run dev`.

## Scripts

- `npm run dev` - Start in watch mode
- `npm run build` - Compile TypeScript
- `npm start` - Run compiled build

## API

- `GET /health` - health check
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user
- `POST /api/auth/logout` - Logout
- `CRUD /api/shops` - Shops
- `CRUD /api/categories` - Categories
- `CRUD /api/products` - Products (upload `images[]`)
- `GET/POST /api/orders` - Orders
- `GET/POST /api/reviews` - Reviews


