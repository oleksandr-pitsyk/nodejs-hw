// Маршрути

// Express Router — об'єкт, який дозволяє групувати маршрути та їх обробники у логічні блоки.
import { Router } from 'express';

// Імпорт бібліотеки валідації
import { celebrate } from 'celebrate';
// Імпорт схем валідації
import {
  getAllNotesSchema,
  noteIdSchema,
  createNoteSchema,
  updateNoteSchema,
} from '../validations/notesValidation.js';

// Імпорт контролерів
import {
  getAllNotes,
  getNoteById,
  createNote,
  deleteNote,
  updateNote,
} from '../controllers/notesController.js';

// Імпорт middleware перевірки аутентифікації
import { authenticate } from '../middleware/authenticate.js';

// Створення роутеру
const router = Router();

// Додаємо middleware аутентифікації до всіх шляхів, що починаються з /notes
// Коли ми приміняємо middleware таким чином - router.use(path, middleware),
// вона будет примінятися до всіх роутів цього роутера.
// Тобто, вона відпрацює на всіх роутах, що починаються зі /notes.
router.use('/notes', authenticate);

// GET-запит до кореневого маршруту "/"
// router.get('/', (req, res) => {
//   res.status(200).json({
//     message: 'Hello world!',
//   });
// });

// GET /notes - Список усіх нотаток
router.get('/notes', celebrate(getAllNotesSchema), getAllNotes);

// GET /notes/:noteId - Конктретна нотатка за id
router.get('/notes/:noteId', celebrate(noteIdSchema), getNoteById);

// POST /notes - Створення нової нотатки
router.post('/notes', celebrate(createNoteSchema), createNote);

// PATCH /notes/:noteId - Редагування нотатки
router.patch('/notes/:noteId', celebrate(updateNoteSchema), updateNote);

// DELETE /notes/:noteId - Видалення нотатки
router.delete('/notes/:noteId', celebrate(noteIdSchema), deleteNote);

// Експорт роутера
export default router;
