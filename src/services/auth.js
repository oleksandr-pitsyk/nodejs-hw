// ========================================================================================
// Допоміжні функції аутентифікації
// ========================================================================================

// Імпорт бібліотеки
import crypto from 'crypto';

// Імпорт констант для часу
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/time.js';

// Імпорт моделі сессії
import { Session } from '../models/session.js';

// ========================================================================================
// createSession(userId)
// ========================================================================================
// Cтворює access та refresh токени, створює сесію в базі даних і повертає її
// ----------------------------------------------------------------------------------------
export const createSession = async (userId) => {
  // Створення токенів з рандомним значенням
  const accessToken = crypto.randomUUID();
  const refreshToken = crypto.randomUUID();
  // Створення часу закунчення дії токену - поточний час + період дії
  // Період дії - для accessToken — 15 хв,
  const accessTokenValidUntil = new Date(Date.now() + FIFTEEN_MINUTES);
  // Період дії - для refreshToken — 1 день.
  const refreshTokenValidUntil = new Date(Date.now() + ONE_DAY);

  // Створюємо нову поточну сессію для користувача - створюємо новий запис в БД Session
  const session = await Session.create({
    userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  // Повертаємо новостворену сесію
  return session;
};

// ========================================================================================
// setSessionCookies(res, session)
// ----------------------------------------------------------------------------------------
// Додає до відповіді три кукі:
//    accessToken
//    refreshToken
//    sessionId
// ----------------------------------------------------------------------------------------
// При встановленні кожної кукі обов’язково встановлюємо однакові параметри:
//    httpOnly: true
//    secure: true
//    sameSite: 'none'
//    maxAge: для accessToken — 15 хв, для refreshToken і sessionId — 1 день.
// Куки налаштовані безпечно:
//    httpOnly — недоступні з клієнтського JS;
//    secure — передаються лише через HTTPS;
//    sameSite: 'none' — дозволяє роботу в крос-доменних сценаріях;
//    maxAge — задає термін дії для кожного cookie.
// ----------------------------------------------------------------------------------------
// Пояснення ключових прапорів:
//    httpOnly: true — браузер не дає доступу до куки з JS (через document.cookie). Зменшує ризик витоку токенів через XSS.
//    secure: true — браузер надсилає таку куку лише через HTTPS. У продакшні це must-have; у дев-режимі без HTTPS такі куки не приліпнуть.
//    sameSite: 'none' — дозволяє надсилати куку у крос-доменних запитах (коли фронтенд і бекенд на різних доменах/порталах). Важливо: SameSite=None вимагає secure: true.
//    Для довідки: lax частково дозволяє крос-сайт (наприклад, при навігації за посиланням), strict — найжорсткіший варіант (тільки свій сайт).
//    maxAge — час життя у мілісекундах. Після спливу браузер перестає надсилати куку.
// ========================================================================================
export const setSessionCookies = (res, session) => {
  res.cookie('accessToken', session.accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: FIFTEEN_MINUTES,
  });

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: ONE_DAY,
  });

  res.cookie('sessionId', session._id, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: ONE_DAY,
  });
};
// ========================================================================================
