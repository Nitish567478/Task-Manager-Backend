const { MongoClient } = require('mongodb');

let client;
let db;

const connectDB = async () => {
  try {
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    db = client.db(); 
    console.log('Connected to MongoDB');
    return db;
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  }
};

const getDB = () => db;

module.exports = { connectDB, getDB };
