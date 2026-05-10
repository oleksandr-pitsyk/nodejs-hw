// ===========================================================================================
// Контролери — це функції, які відповідають за обробку запитів і формування відповіді.
// ===========================================================================================

// Імпорт функції для створення помилок з пакету http-errors.
// Він дозволяє створювати помилки з потрібним статусом і повідомленням.
import createHttpError from 'http-errors';

// Імпорт моделі нотаток Note
import { Note } from '../models/note.js';

// GET /notes - Список усіх нотаток
export const getAllNotes = async (req, res) => {
  const notes = await Note.find();
  res.status(200).json(notes);
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
