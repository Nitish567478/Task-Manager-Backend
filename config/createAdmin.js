const { getDB } = require('./mongo');
const bcrypt = require('bcryptjs');

const createAdminUser = async () => {
  const db = getDB();

  const admin = await db.collection('users').findOne({ role: 'admin' });

  if (admin) {
    console.log("Admin already exists.");
    return;
  }

  const hashedPassword = await bcrypt.hash('admin#1234', 10);

  await db.collection('users').insertOne({
    username: 'admin',
    password: hashedPassword,
    role: 'admin',
    createdAt: new Date(),
  });

  console.log("Admin created: username=admin, password=admin#1234");
};

module.exports = createAdminUser;
