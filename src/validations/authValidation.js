// Схеми валідації аутентифікації

// Імпорт бліотеки валідації
import { Joi, Segments } from 'celebrate';

// Схема валідації регістрації нового користувача
// Тіло запиту має містити:
//    email — рядок, email, обов’язкове;
//    password — рядок, мінімум 8 символів, обов’язкове (на сервері хешується через bcrypt).
export const registerUserSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string(),
    password: Joi.string().min(8).required(),
  }),
};

// Схема валідаціі логіна користувача
// Тіло запиту має містити:
//    email — рядок, email, обов’язкове
//    password — рядок, обов’язкове
export const loginUserSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};
