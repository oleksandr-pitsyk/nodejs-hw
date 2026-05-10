// src/middleware/errorHandler.js
// глобальна обробка помилок: повертає статус 500,
// або інші статуси у разі використання бібліотеки http-errors та наступний об’єкт:
// { message: повідомлення про помилку }
// Він приймає 4 аргументи: (err, req, res, next).
import { HttpError } from 'http-errors';

export const errorHandler = (err, req, res, next) => {
  // Якщо помилка створена через http-errors
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      message: err.message || err.name,
    });
  }

  // Перевірка середовища :
  // development - режим розробки
  // production - режим використання користувачем
  const isProd = process.env.NODE_ENV === 'production';

  // Усі інші помилки — як внутрішні
  // В режимі development - виводиться конкретне повідомлення про отриману раніше помилку.
  res.status(500).json({
    message: isProd ? 'Something went wrong. Please try again later.' : err.message,
  });
};
