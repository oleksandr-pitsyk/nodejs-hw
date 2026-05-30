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

// Схема валідації - email користувача для скидання паролю
// Тіло запиту має містити:
// email - рядок типу email, обов’язкове поле.
export const requestResetEmailSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
  }),
};

// Схема валідації - пароля та токена для оновлення паролю
//    password — новий пароль, який користувач хоче встановити.
//    token — підписаний JWT, який ми надіслали в листі (дійсний упродовж 15 хв).
// Тіло запиту має містити:
//    password - рядок, обов’язкове поле;
//    token - рядок, обов’язкове поле;
export const resetPasswordSchema = {
  [Segments.BODY]: Joi.object({
    password: Joi.string().min(8).required(),
    token: Joi.string().required(),
  }),
};
