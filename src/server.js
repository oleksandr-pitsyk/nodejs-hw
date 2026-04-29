// Сервер

// Імпорт фреймворка для Node.js - Express - для створення веб-сервера.
// Він спрощує створення HTTP-серверів та REST API:
import express from 'express';

// Імпорт бібліотеки CORS - для дозволу запитів з інших джерел
import cors from 'cors';
// Імпорт бібліотеки - Логування запитів
import pino from 'pino-http';
// Імпорт та налаштування пакету для читання змінних оточення з файлу .env
import 'dotenv/config';

// Створення екземпляру Express-додатку
const app = express();

// Використовуємо значення з .env (process.env.PORT) або дефолтний порт 3000
const PORT = process.env.PORT ?? 3000;

// Middleware
// Вбудоване middleware — express.json() - для парсингу JSON.
// Воно автоматично парсить (розпаковує) тіло HTTP-запиту, якщо воно надійшло у форматі JSON,
// і додає його у req.body.
app.use(express.json());

// Middleware
// Дозволяє запити з будь-яких джерел
app.use(cors());

// Middleware
// Підключення та алаштування - Логування запитів
// Повідомлення у консолі робить зручними та читабельними
// Конфігурація: кольоровий текст, час запиту, HTTP-метод, шлях і статус відповіді.
app.use(
  pino({
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
        messageFormat: '{req.method} {req.url} {res.statusCode} - {responseTime}ms',
        hideObject: true,
      },
    },
  }),
);

// GET-запит до кореневого маршруту "/"
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Hello world!',
  });
});

// GET-запит - Список усіх нотаток
app.get('/notes', (req, res) => {
  res.status(200).json([{ message: 'Retrieved all notes' }]);
});

// GET-запит - Конктретна нотатка за id
app.get('/notes/:noteId', (req, res) => {
  // Параметри завжди приходять у вигляді рядків. Якщо потрібне число, його треба конвертувати
  const { noteId } = req.params;
  res.status(200).json({ message: `Retrieved note with ID: ${noteId}` });
});

// Маршрут для тестування middleware помилки
app.get('/test-error', (req, res) => {
  // Штучна помилка для прикладу
  throw new Error('Simulated server error');
});

// Middleware 404 - для неіснуючих маршрутів
// Підключається після всіх маршрутів, але перед middleware для обробки помилок.
// Якщо жоден із маршрутів не збігся, керування дійде сюди.
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Middleware для обробки помилок - має бути останнім після всіх маршрутів та інших middleware.
// Він приймає 4 аргументи: (err, req, res, next).
app.use((err, req, res, next) => {
  // Вивід помилки в консоль терміналу
  console.error(err);
  // Перевірка середовища :
  // development - режим розробки
  // production - режим використання користувачем
  const isProd = process.env.NODE_ENV === 'production';
  // В режимі development - виводиться конкретне повідомлення про отриману раніше помилку.
  res.status(500).json({
    message: isProd ? 'Something went wrong. Please try again later.' : err.message,
  });
});

// Запуск сервера - прослуховування вказаного порту
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
