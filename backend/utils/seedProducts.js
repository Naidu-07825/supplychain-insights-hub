const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const bcrypt = require('bcryptjs');

const N = parseInt(process.env.SEED_PRODUCT_COUNT || '10', 10);

const seed = async () => {
  await connectDB();

  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    const hashed = await bcrypt.hash(process.env.SEED_ADMIN_PASS || 'password', 10);
    admin = await User.create({ name: 'Admin', email: process.env.SEED_ADMIN_EMAIL || 'admin@example.com', password: hashed, role: 'admin', isVerified: true });
    console.log('Created admin user', admin.email);
  }

  // remove any existing seeded products created by this script (same admin)
  await Product.deleteMany({ createdBy: admin._id });

  const sample = [
    { name: 'Surgical Gloves', description: 'Latex gloves', quantity: 100 },
    { name: 'Face Masks', description: 'N95 masks', quantity: 200 },
    { name: 'Hand Sanitizer', description: 'Alcohol-based sanitizer', quantity: 150 },
    { name: 'IV Fluid', description: 'Sterile IV fluids', quantity: 80 },
    { name: 'Syringes', description: '5ml syringes', quantity: 300 },
    { name: 'Bandages', description: 'Sterile bandages', quantity: 120 },
    { name: 'Thermometers', description: 'Digital thermometers', quantity: 60 },
    { name: 'Surgical Gowns', description: 'Disposable gowns', quantity: 90 },
    { name: 'Oxygen Masks', description: 'Adult oxygen masks', quantity: 40 },
    { name: 'Antibiotic Ointment', description: 'Topical ointment', quantity: 70 },
  ];

  const products = [];
  for (let i = 0; i < N; i++) {
    const p = sample[i % sample.length];
    products.push({ name: p.name, description: p.description, quantity: p.quantity, createdBy: admin._id });
  }

  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products for admin ${admin.email}`);
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
