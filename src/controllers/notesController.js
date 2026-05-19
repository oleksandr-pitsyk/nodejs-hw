// ===========================================================================================
// Контролери — це функції, які відповідають за обробку запитів і формування відповіді.
// ===========================================================================================

// Імпорт функції для створення помилок з пакету http-errors.
// Він дозволяє створювати помилки з потрібним статусом і повідомленням.
import createHttpError from 'http-errors';

// Імпорт моделі нотаток Note
import { Note } from '../models/note.js';

// GET /notes - Список усіх нотаток
// Приклад GET запиту буде виглядати наступним чином:
// http://localhost:3030/notes?page=1&perPage=15&tag=Todo&search=hello
// Можливість пагінації до маршруту GET /notes через параметри рядка запиту:
//    page - номер сторінки запиту (за замовчуванням 1)
//    perPage - кількість елементів на сторінці (за замовчуванням 10)
// Фільтрація :
//    - по полю tag
//    - по поиску - search в полях title / content
// Клієнт може передати параметри sortBy (поле для сортування) і sortOrder (порядок).
// Якщо параметри не передані — застосовується сортування за замовчуванням по _id.
export const getAllNotes = async (req, res) => {
  // Деструктуризація параметрів рядка запиту
  const {
    page = 1,
    perPage = 10,
    tag,
    search,
    // Отримуємо значення параметрів сортування
    // дефолтне сортування по _id
    sortBy = '_id',
    // дефолтне сортування по зростанню
    sortOrder = 'asc',
  } = req.query;
  // Розрахунок кількості запитів, які треба пропустити
  const skip = (page - 1) * perPage;

  // Створення основного запиту в БД
  const notesQuery = Note.find();

  // Будуємо фільтрацію запиту
  // Якщо є параметр запиту по тегу
  if (tag) {
    notesQuery.where('tag').equals(tag);
  }

  // Якщо є параметр запиту по пошуку ЦІЛОГО слова (пошук в title або content)
  // Для цього в схемі зроблений текстовий індех в полях title та content
  // Note.find({ $text: { $search: 'javascript' } });
  if (search) {
    notesQuery.where({
      $text: { $search: search },
    });
  }

  // Якщо є параметр запиту по пошуку слова або частині слова (пошук тільки в title)
  // Для $regex - індекс НЕ потрібний
  // if (search) {
  //   notesQuery.where({
  //     title: { $regex: search, $options: 'i' },
  //   });
  // }

  // Якщо є параметр запиту по пошуку слова або частини слова (пошук в title або content)
  // Буде шукати і в title, і в content --- $or []:
  // if (search) {
  //   notesQuery.where({
  //     $or: [
  //       { title: { $regex: search, $options: 'i' } },
  //       { content: { $regex: search, $options: 'i' } },
  //     ],
  //   });
  // }

  // Сортування

  // Запуск запитів в БД на пошук :
  //    - Загальна кількість нотаток (склонованим запитом) методом countDocuments()
  //    - Список нотаток - skip(пропускаємо нотаток).limit(кількість на сторінці)
  const [totalNotes, notes] = await Promise.all([
    notesQuery.clone().countDocuments(),
    notesQuery
      .skip(skip)
      .limit(perPage)
      .sort({ [sortBy]: sortOrder }),
  ]);

  // Розрахунок загальної кількості сторінок (округлення вгору)
  const totalPages = Math.ceil(totalNotes / perPage);

  // У разі вдалої обробки запиту відповідь сервера має бути зі статусом 200
  // та містити об’єкт із наступними властивостями:
  //    page - поточна сторінка
  //    perPage - кількість елементів в одній сторінці
  //    totalNotes - загальна кількість нотаток в колекції
  //    totalPages - загальна кількість сторінок
  //    notes - масив нотаток
  res.status(200).json({
    page,
    perPage,
    totalNotes,
    totalPages,
    notes,
  });
};

// GET /notes/:noteId - Конктретна нотатка за id
export const getNoteById = async (req, res) => {
  // Параметри завжди приходять у вигляді рядків. Якщо потрібне число, його треба конвертувати
  const { noteId } = req.params;
  const note = await Note.findById(noteId);
  // Якщо нотатку з таким id не знайдено, повертаємо статус 404 та повідомлення про помилку
  if (!note) {
    throw createHttpError(404, 'Note not found');
    // return res.status(404).json({ message: 'Note not found' });
  }
  // Якщо нотатку знайдено, повертаємо її у відповіді з статусом 200
  res.status(200).json(note);
};

// POST /notes - Створення нової нотатки
export const createNote = async (req, res) => {
  // Дані для створення нотатки приходять у тілі запиту (req.body) у форматі JSON
  // Створюємо нову нотатку у базі даних за допомогою моделі Note
  const note = await Note.create(req.body);
  // Після успішного створення повертаємо статус 201 (Created) та новостворену нотатку у відповіді
  res.status(201).json(note);
};

// PATCH /notes/:noteId - Редагування нотатки
export const updateNote = async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findOneAndUpdate(
    { _id: noteId }, // Шукаємо по id
    req.body,
    { returnDocument: 'after' }, // повертаємо оновлений документ
  );

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json(note);
};

// DELETE /notes/:noteId - Видалення нотатки
export const deleteNote = async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findOneAndDelete({ _id: noteId });
  if (!note) {
    throw createHttpError(404, 'Note not found');
  }
  res.status(200).json(note);
};
