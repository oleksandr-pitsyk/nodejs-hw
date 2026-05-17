// src/db/connectMongoDB.js
// Функція для підключення до бази даних MongoDB за допомогою бібліотеки Mongoose.
import mongoose from 'mongoose';

// Імпорт моделі за схемою нотаток
import { Note } from '../models/note.js';

export const connectMongoDB = async () => {
  try {
    // Отримуємо URL для підключення до MongoDB з змінних оточення
    const mongoUrl = process.env.MONGO_URL;

    // Підключаємося до MongoDB за допомогою Mongoose
    await mongoose.connect(mongoUrl);

    // Переіндексація БД - гарантуємо, що індекси в БД відповідають схемі
    // Це доповнення:
    //    прочитає індекси зі схеми Mongoose;
    //    порівняє їх з індексами у базі;
    //    створить відсутні індекси;
    //    видалить зайві.
    await Note.syncIndexes();

    // у разі успіху виводимо повідомлення, що підключення встановлено
    console.log('✅ MongoDB connection established successfully');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1); // аварійне завершення програми
  }
};
