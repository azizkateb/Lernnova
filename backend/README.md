# Lernnova Backend

Backend API for Lernnova, a hybrid digital services marketplace and digital products store.

## Tech Stack

- Node.js
- Express.js
- Prisma
- MySQL
- JWT Authentication
- Multer File Upload
- Stripe Checkout integration prepared

## Features

- Authentication and roles: buyer, seller, admin
- Digital services marketplace
- Service orders
- Order messaging
- Order file delivery
- Digital products store
- Product orders
- Manual payment confirmation
- Protected downloads
- Buyer dashboard
- Seller dashboard
- Admin dashboard
- Stripe integration prepared for future activation

## Setup
npm install

Create `.env` based on `.env.example`.

Run Prisma migration:

npx prisma migrate dev
npx prisma generate


Start development server: npm run dev



## API Base URL
http://localhost:5000


## Notes

Stripe is currently prepared but not active until valid Stripe keys are provided.

