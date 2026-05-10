// src/middleware/logger.js
// Логування HTTP-запитів за допомогою pino-http
// Імпорт бібліотеки - Логування запитів
import pino from 'pino-http';

// Повідомлення у консолі робить зручними та читабельними, додаючи кольори та форматування.
// Конфігурація для pino-http - кольоровий текст, час запиту, HTTP-метод, шлях і статус відповіді.

export const logger = pino({
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
});
