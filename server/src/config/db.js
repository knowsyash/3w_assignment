import mongoose from 'mongoose';

export async function connectDB(mongoUri) {
    if (!mongoUri) {
        throw new Error('MONGO_URI is not defined');
    }

    await mongoose.connect(mongoUri, {
        dbName: process.env.MONGO_DB_NAME || '3w',
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
    });

    console.log('[DB] Connected to MongoDB Atlas');
}