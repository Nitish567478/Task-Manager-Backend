require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const uri = process.env.MONGO_URI;

(async () => {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db();
    const users = db.collection('users');
    const adminExists = await users.findOne({ username: 'admin' });

    if (adminExists) {
      console.log('Admin already exists:', adminExists.username);
      process.exit(0);
    }

    const hashed = await bcrypt.hash('123456', 10);
    const res = await users.insertOne({
      name: 'Administrator',
      email: 'admin@example.com',
      username: 'admin',
      password: hashed,
      role: 'admin',
      createdAt: new Date()
    });

    console.log('Admin created with id', res.insertedId.toString());
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
    process.exit(0);
  }
})();
