// ==========================================================================================
// Маршрути аутентифікації
// ==========================================================================================

// Express Router — об'єкт, який дозволяє групувати маршрути та їх обробники у логічні блоки.
import { Router } from 'express';

// Імпорт бібліотеки валідації
import { celebrate } from 'celebrate';
// Імпорт схем валідації
import { registerUserSchema, loginUserSchema } from '../validations/authValidation.js';

// Імпорт контролерів
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshUserSession,
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

// Експорт роутера
export default router;
