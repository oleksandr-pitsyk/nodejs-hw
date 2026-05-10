// Схема та модель для колекції "notes" у MongoDB
import { Schema, model } from 'mongoose';

// Схема визначає структуру документів у колекції "notes".
const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: true, // робить поле обов'язковим для заповнення
      trim: true, // прибирає пробіли на початку та в кінці рядка
    },
    content: {
      type: String,
      trim: true, // прибирає пробіли на початку та в кінці рядка
    },
    tag: {
      type: String,
      enum: [
        'Work',
        'Personal',
        'Meeting',
        'Shopping',
        'Ideas',
        'Travel',
        'Finance',
        'Health',
        'Important',
        'Todo',
      ], // перелік допустимих значень
      default: 'Todo', // значення за замовчуванням, якщо поле не передано
    },
  },
  {
    timestamps: true, // автоматично додає createdAt і updatedAt
    versionKey: false, // вимикає службове поле __v
  },
);

// Модель - це клас, який ми використовуємо для створення та взаємодії з документами у колекції "notes".
// Перший аргумент - це назва моделі (у цьому випадку "Note"), яка також визначає назву колекції у MongoDB (у множині, тобто "notes").
// Другий аргумент - це схема, яка описує структуру документів цієї моделі.
export const Note = model('Note', noteSchema);
