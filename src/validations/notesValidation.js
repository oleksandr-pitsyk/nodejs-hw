// Схеми валідації вхідних даних

// Імпорт бліотеку валідації
// Joi — мова опису схем об’єктів і валідатор.
// celebrate — дозволяє інтегрувати Joi безпосередньо у маршрути Express.
// Бібліотека celebrate містить Joi
// Joi — це бібліотека для валідації даних у Node.js. Вона дозволяє:
//    створювати схеми для об’єктів;
//    перевіряти об’єкти на відповідність цим схемам;
//    налаштовувати повідомлення про помилки.
// Segments - визначає, яку саме частину HTTP-запиту ця схема має валідувати.
import { Joi, Segments } from 'celebrate';

// isValidObjectId(value) — це утиліта з Mongoose, яка перевіряє, чи рядок відповідає формату MongoDB ObjectId.
import { isValidObjectId } from 'mongoose';

// Імпорт списку допустимих тегів
import { TAGS } from '../constants/tags.js';

// Кастомний валідатор для ObjectId
// Перевіряє корректність ID
const objectIdValidator = (value, helpers) => {
  // Якщо isValidObjectId повертає false,
  // ми викликаємо helpers.message('Invalid id format'), щоб створити помилку в Joi.
  // Якщо все гаразд, функція просто повертає значення далі.
  return !isValidObjectId(value) ? helpers.message('Invalid id format') : value;
};

// Для маршруту GET /notes
// потрібно валідувати параметри рядка запиту:
//    page - ціле число, мінімальне значення 1, за замовчуванням 1.
//    perPage - ціле число, мінімальне значення 5, максимальне 20, за замовчуванням 10.
//    tag - рядок, одне із можливих значень із файла src/contacts/tags.js, необов’язкове поле
//    search - рядок, можливо передавати порожній рядок
export const getAllNotesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'page must be a number',
      'number.min': 'page must be at least {#limit}',
    }),
    perPage: Joi.number().integer().min(5).max(20).default(10).messages({
      'number.base': 'perPage must be a number',
      'number.min': 'perPage must be at least {#limit}',
      'number.max': 'perPage must be at most {#limit}',
    }),
    tag: Joi.string().valid(...TAGS),
    search: Joi.string().trim().allow(''),
  }),
};

// Для маршрутів GET /notes/:noteId та DELETE /notes/:noteId
// потрібно валідувати параметр запиту noteId:
//    noteId - валідуємо як рядок із кастомною валідацію через isValidObjectId із mongoose.

export const noteIdSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().custom(objectIdValidator).required(),
  }),
};

// Для маршруту POST /notes
// потрібно валідувати тіло запиту як об’єкт із наступними властивостями:
//    title - рядок, мінімум 1 символ, обов’язкове поле
//    content - рядок, може бути порожнім рядком, необов’язкове поле
//    tag - одне зі значень із файла src/contacts/tags.js, необов’язкове поле.

export const createNoteSchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1).required().messages({
      'any.required': 'title is required',
    }),
    content: Joi.string().allow(''),
    tag: Joi.string().valid(...TAGS),
  }),
};

// Для маршруту PATCH /notes/:noteId
// потрібно валідувати параметр запиту noteId та тіло запиту як об’єкт із наступними властивостями:
//    title - рядок, мінімум 1 символ, необов’язкове поле
//    content - рядок, може бути порожнім рядком, необов’язкове поле
//    tag - одне із значень із файла src/contacts/tags.js, необов’язкове поле
// Додайте перевірку, що хоча б одне з полів `title`, `content` або `tag` буде присутнім
// тобто тіло запиту не має бути порожнім.

export const updateNoteSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().custom(objectIdValidator).required(),
  }),
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1),
    content: Joi.string().allow(''),
    tag: Joi.string().valid(...TAGS),
  }).min(1),
};
