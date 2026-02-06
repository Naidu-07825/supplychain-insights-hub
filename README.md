# SupplyChain Insights Hub

This repository implements a full-stack web app for hospital product management.

Quick run (backend):

1. Create `.env` in `backend/` with these vars:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/supplychain
JWT_SECRET=your_jwt_secret
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_email_password_or_app_password
SEED_PRODUCT_COUNT=10
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASS=password
```

2. Install and start backend:

```bash
cd backend
npm install
npm run seed:products   # optional: seed admin + products
npm start
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Notes:
- Socket.IO is used for realtime order updates.
- Emails require valid SMTP credentials (Gmail recommended with app password).
- Theme preference persisted in `localStorage`.

Testing / Verification:
- After starting backend and frontend, register a hospital user, verify OTP, login, place an order from Hospital Dashboard.
- Admin can view orders at `/admin/orders`, accept/cancel and change status; delivered status reduces product stock and triggers low-stock emails.

For development help, open issues or ask for additional features.
