// ==========================================================================================
// Маршрути аутентифікації
// ==========================================================================================

// Express Router — об'єкт, який дозволяє групувати маршрути та їх обробники у логічні блоки.
import { Router } from 'express';

// Імпорт бібліотеки валідації
import { celebrate } from 'celebrate';
// Імпорт схем валідації
import {
  registerUserSchema,
  loginUserSchema,
  requestResetEmailSchema,
  resetPasswordSchema,
} from '../validations/authValidation.js';

// Імпорт контролерів
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshUserSession,
  requestResetEmail,
  resetPassword,
} from '../controllers/authController.js';

// Створення роутеру
const router = Router();

// POST /auth/register - Реєстрація нового користувача.
router.post('/auth/register', celebrate(registerUserSchema), registerUser);

// POST /auth/login - Логін зареєстрованого користувача (Вхід в систему).
router.post('/auth/login', celebrate(loginUserSchema), loginUser);

// POST /auth/logout - Виход користувача із системи.
router.post('/auth/logout', logoutUser);

// POST /auth/refresh - Оновлення сесії
router.post('/auth/refresh', refreshUserSession);

// POST /auth/request-reset-email - Генерація токена та відправка листа з посиланням
//  - перевіряє email користувача,
//  - генерує JWT-токен,
//  - відправляє лист із посиланням для скидання паролю.
router.post('/auth/request-reset-email', celebrate(requestResetEmailSchema), requestResetEmail);

// POST /auth/reset-password - Оновлення пароля користувача
//  - приймає токен і новий пароль,
//  - перевіряє токен,
//  - оновлює пароль користувача.
router.post('/auth/reset-password', celebrate(resetPasswordSchema), resetPassword);

// Експорт роутера
export default router;
