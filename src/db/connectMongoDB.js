// src/db/connectMongoDB.js
// Функція для підключення до бази даних MongoDB за допомогою бібліотеки Mongoose.
import mongoose from 'mongoose';

export const connectMongoDB = async () => {
  try {
    // Отримуємо URL для підключення до MongoDB з змінних оточення
    const mongoUrl = process.env.MONGO_URL;
    // Підключаємося до MongoDB за допомогою Mongoose
    await mongoose.connect(mongoUrl);
    // у разі успіху виводимо повідомлення, що підключення встановлено
    console.log('✅ MongoDB connection established successfully');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1); // аварійне завершення програми
  }
};
