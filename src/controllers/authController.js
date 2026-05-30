// ===========================================================================================
// Контролери — це функції, які відповідають за обробку запитів і формування відповіді.
// ===========================================================================================

// Імпорт функції для створення помилок з пакету http-errors.
// Він дозволяє створювати помилки з потрібним статусом і повідомленням.
import createHttpError from 'http-errors';

// Імпорт моделі користувача User
import { User } from '../models/user.js';

// Імпорт моделі сесії Session
import { Session } from '../models/session.js';

// Імпорт бібліотеки хешування паролів
import bcrypt from 'bcrypt';

// Імпорт функції створення сесії
import { createSession, setSessionCookies } from '../services/auth.js';

// Імпорт функції для відправки листа
import { sendEmail } from '../utils/sendMail.js';

// Імпорт фукнції для створення JWT-токена
import jwt from 'jsonwebtoken';

// Імпорт шаблонізатора handlebars
import handlebars from 'handlebars';
// Імпорт функцій Node.js для роботи з файловою системою
import path from 'node:path';
import fs from 'node:fs/promises';

// =======================================================================================
// POST /auth/register - Реєстрація нового користувача.
// ---------------------------------------------------------------------------------------
// Дані приходять у тілі запиту - Тіло запиту має містити:
//    email — рядок, email, обов’язкове;
//    password — рядок, мінімум 8 символів, обов’язкове (на сервері хешується через bcrypt).
// ---------------------------------------------------------------------------------------
// Контролер registerUser :
//    Перевіряє, чи користувач із таким email вже існує. Якщо так — повертає через createHttpError помилку зі статусом 400 і повідомленням 'Email in use'
//    Хешує пароль за допомогою bcrypt
//    Створює нового користувача в базі
//    Створює нову сесію (createSession) і додає кукі (setSessionCookies) до відповіді
// У разі вдалої обробки запиту повертає відповідь зі статусом 201
// і об’єктом створеного користувача (без пароля завдяки методу схеми toJSON) — res.status(201).json(user).
// ---------------------------------------------------------------------------------------

export const registerUser = async (req, res) => {
  const { email, password, username } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createHttpError(400, 'Email in use');
  }

  // Хешуємо пароль
  const hashedPassword = await bcrypt.hash(password, 10);

  // Створення користувача
  const newUser = await User.create({
    email: email,
    username: username,
    password: hashedPassword,
  });

  // Після реєстрації створюємо нову сесію для нового користувача.
  const newSession = await createSession(newUser._id);
  // Додаємо у відповідь 3 куки - Викликаємо, передаємо об'єкт відповіді та сесію
  setSessionCookies(res, newSession);

  // Відправляємо дані користувача (без пароля) у відповіді
  res.status(201).json(newUser);
};

// =======================================================================================
// POST /auth/login - Логін зареєстрованого користувача (Вхід в систему).
// ---------------------------------------------------------------------------------------
// Перевіряє, чи користувач із таким email існує в базі даних.
//    Якщо ні — повертає через createHttpError помилку зі статусом 401 і повідомленням 'Invalid credentials';
// Перевіряє чи вірний пароль.
//    Якщо ні — повертає через createHttpError помилку зі статусом 401 і повідомленням 'Invalid credentials';
// Видаляє стару сесію цього користувача та створює нову (createSession) і додає кукі (setSessionCookies) до відповіді;
// У разі вдалої обробки запиту повертає відповідь зі статусом 200 і об’єктом залогіненого користувача (без пароля завдяки методу схеми toJSON) — res.status(200).json(user).

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Перевіряємо чи користувач з такою поштою існує
  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }

  // Порівнюємо хеші паролів (введеного та в БД)
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw createHttpError(401, 'Invalid credentials');
  }

  // Після логіну — видаляємо стару сесію (якщо була) і створюємо нову, щоб уникнути конфліктів.
  await Session.deleteOne({ userId: user._id });

  // Створюємо сесію для поточного користувача
  const newSession = await createSession(user._id);
  // Додаємо у відповідь 3 куки - Викликаємо, передаємо об'єкт відповіді та сесію
  setSessionCookies(res, newSession);

  // Повертаємо дані про поточного користувача
  res.status(200).json(user);
};

// =======================================================================================
// POST /auth/logout - Вихід користувача із системи.
// ---------------------------------------------------------------------------------------
// Перевіряє, чи є у cookies sessionId. Якщо є — видаляє відповідну сесію з бази даних;
// Очищає cookies sessionId, accessToken та refreshToken за допомогою res.clearCookie;
// Повертає відповідь зі статусом 204(без тіла).
// ---------------------------------------------------------------------------------------
// Маршрут не приймає тіло запиту, усі необхідні дані (sessionId) беруться з cookies.
// ---------------------------------------------------------------------------------------

export const logoutUser = async (req, res) => {
  // Отримуємо з запиту від фронтенда з куків - інформацію про сесію
  const { sessionId } = req.cookies;
  // Якщо сесія така є в куках - видаляємо запис про сесію з БД
  if (sessionId) {
    await Session.deleteOne({ _id: sessionId });
  }
  // Очищаєmo cookies sessionId, accessToken та refreshToken за допомогою res.clearCookie
  res.clearCookie('sessionId');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  // Повертає відповідь зі статусом 204(без тіла).   send()-кінець відповіді
  res.status(204).send();
};
// =======================================================================================

// =======================================================================================
// POST /auth/refresh - Оновлення сесії
// ---------------------------------------------------------------------------------------
// Ротація токенів за допомогою refresh-токена.
// ---------------------------------------------------------------------------------------
// шукає у базі даних сесію за sessionId та refreshToken з cookies;
// якщо сесія не знайдена — повертає через createHttpError помилку зі статусом 401 і повідомленням 'Session not found';
// перевіряє, чи не прострочений refresh-токен; якщо так — повертає через createHttpError помилку зі статусом 401 і повідомленням 'Session token expired';
// видаляє стару сесію з бази;
// створює нову сесію (createSession) і додає нові кукі (setSessionCookies) до відповіді;
// у разі вдалої обробки запиту повертає відповідь зі статусом 200 і об’єктом з повідомленням
// ---------------------------------------------------------------------------------------
export const refreshUserSession = async (req, res) => {
  // Отримуємо дані з кукі запиту
  const { sessionId, refreshToken } = req.cookies;

  // Якщо немає ідентифікатора сесії або токена - refreshToken, повертаємо помилку
  if (!sessionId || !refreshToken) {
    throw createHttpError(401, 'Missing session credentials');
  }

  // Знаходимо поточну сесію за id сесії та рефреш токеном
  const session = await Session.findOne({
    _id: sessionId,
    refreshToken,
  });

  // Якщо такої сесії нема, повертаємо помилку
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  // Якщо сесія існує, перевіряємо валідність рефреш токена
  // Дата дії рефреш токена має бути менша за теперішній час
  const isSessionTokenExpired = session.refreshTokenValidUntil < new Date();

  // Якщо термін дії рефреш токена вийшов, видаляємо сесію і повертаємо помилку
  if (isSessionTokenExpired) {
    // Видалення сесії
    await session.deleteOne();
    // Очистка кукі
    res.clearCookie('sessionId');
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    // Створення пимилки
    throw createHttpError(401, 'Session token expired');
  }

  // Якщо всі перевірки пройшли добре, видаляємо поточну сесію
  await session.deleteOne();

  // Створюємо нову сесію та додаємо кукі
  const newSession = await createSession(session.userId);
  setSessionCookies(res, newSession);

  // Повертаємо статус 200 та об'єкт з повідомленням
  res.status(200).json({
    message: 'Session refreshed',
  });
};
// =======================================================================================

// =======================================================================================
// POST /auth/request-reset-email - Генерація токена та відправка листа з посиланням
// ---------------------------------------------------------------------------------------
//  - перевіряє email користувача,
//  - генерує JWT-токен,
//  - відправляє лист із посиланням для скидання паролю.
// ---------------------------------------------------------------------------------------
//    Знайдіть користувача за переданим email. Якщо користувача не знайдено, то поверніть відповідь зі статусом 200 і повідомленням: { message: 'Password reset email sent successfully' }
//    Згенеруйте JWT-токен, який містить sub (id користувача) та email. Термін життя токена — 15 хвилин.
//    Зробіть HTML-лист на основі шаблону src/templates/reset-password-email.html (використовуйте handlebars для підстановки даних, таких як ім’я користувача та посилання).
//    Посилання в листі має вести на фронтенд (домен береться з env-змінної FRONTEND_DOMAIN) та мати вигляд:
//        <FRONTEND_DOMAIN>/reset-password?token=<jwt-token>
//    Використайте утиліту sendEmail з файлу src/utils/sendMail.js для надсилання листа з посиланням для скиду паролю. В цій утиліті за допомогою пакету nodemailer організуйте відправку емейла користувачу.
//    Якщо надсилання листа не вдалося, то використовуючи бібліотеку createHttpError поверніть відповідь зі статусом 500 і повідомленням 'Failed to send the email, please try again later.'.
//    У разі успіху поверніть відповідь зі статусом 200 і повідомленням:
//        {message: 'Password reset email sent successfully' }
// ---------------------------------------------------------------------------------------

export const requestResetEmail = async (req, res) => {
  // Отримуємо email з тіла запиту
  const { email } = req.body;
  // Шукаємо в БД користувача за email
  const user = await User.findOne({ email });
  // Якщо користувача нема — навмисно повертаємо ту саму "успішну"
  // відповідь без відправлення листа (захист від хакерів - anti user enumeration).
  // Однакові відповіді із статусом 200 це щоб унеможливити «вичитування» наявності облікового запису.
  if (!user) {
    res.status(200).json({ message: 'Password reset email sent successfully' });
  }

  // Якщо Користувач є в БД
  // Генеруємо короткоживучий JWT
  const resetToken = jwt.sign({ sub: user._id, email }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  console.log(`resetToken = `, resetToken);

  // Створюємо тіло листа користувачу, використовуючи шаблон :
  // 1. Формуємо шлях до шаблона - Отримуємо шлях до HTML-шаблона
  const templatePath = path.resolve('src/templates/reset-password-email.html');
  // 2. Читаємо файл шаблон - читаємо його як текст.
  const templateSource = await fs.readFile(templatePath, 'utf-8');
  // 3. Готуємо шаблон до заповнення - перетворює сирий шаблон на функцію, яку можна викликати з даними.
  const template = handlebars.compile(templateSource);
  // 4. Формуємо із шаблона HTML документ з динамічними даними -
  // Передаємо у шаблон об’єкт { name, link } — на виході маємо готовий HTML з підставленими значеннями.
  const html = template({
    name: user.username,
    link: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`,
  });

  // відправляємо лист користувачу з  токеном та опціями для листа
  // from - від кого
  // to - кому
  // subject - тема листа (заголовок)
  // html - склад листа в html-вигляді
  try {
    await sendEmail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset your password',
      // 5. Передаємо HTML, створений за допомогою шаблонізатора у функцію надписання пошти
      html,
    });
  } catch {
    // Якщо надсилання листа не вдалося, то генеруємо помилку
    throw createHttpError(500, 'Failed to send the email, please try again later.');
  }

  res.status(200).json({ message: 'Password reset email sent successfully' });
};

// =======================================================================================

// =======================================================================================
// POST /auth/reset-password - Оновлення пароля користувача
// ---------------------------------------------------------------------------------------
//  - приймає токен і новий пароль,
//  - перевіряє та декодує токен,
//  - знаходить користувача
//  - хешує новий пароль
//  - оновлює пароль користувача.
// ---------------------------------------------------------------------------------------
// В body він приймє:
//    token - JWT токен, який був переданий у посилання для скиду паролю
//    password - новий пароль.
// ---------------------------------------------------------------------------------------
//    Верифікуйте отриманий в тілі запиту jwt-токен. Якщо токен невалідний або прострочений, використовуючи бібліотеку createHttpError, поверніть відповідь зі статусом 401 і повідомленням 'Invalid or expired token'.
//    Знайдіть користувача за sub та email, які містяться в токені. Якщо користувача не знайдено, використовуючи бібліотеку createHttpError, поверніть відповідь зі статусом 404 і повідомленням 'User not found'.
//    Зашифруйте новий пароль за допомогою бібліотеки bcrypt.
//    Оновіть пароль користувача в базі даних.
//    У разі успіху поверніть відповідь зі статусом 200 та повідомленням:
//        { 	message: 'Password reset successfully' }
// ---------------------------------------------------------------------------------------

export const resetPassword = async (req, res) => {
  // Отримуємо дані з тіла запиту
  const { token, password } = req.body;

  // Перевіряємо/декодуємо токен
  let payload;
  try {
    // Перевірка токена.
    // jwt.verify() гарантує дійсність і непідробність токена, а також перевіряє строк дії (expiresIn).
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    // Повертаємо помилку якщо проблема при декодуванні
    throw createHttpError(401, 'Invalid or expired token');
  }

  // Пошук користувача. Для надійності використовуємо і sub (id), і email із payload.
  const user = await User.findOne({ _id: payload.sub, email: payload.email });
  // Якщо користувача не існує, повертаємо помилку
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  // Якщо користувач існує :

  // Оновлення пароля.
  // Пароль ніколи не зберігаємо у відкритому вигляді — тільки у вигляді хешу (bcrypt.hash).
  const hashedPassword = await bcrypt.hash(password, 10);

  // Оновлюємо користувача - пошук по id та змінюємо пароль
  await User.updateOne({ _id: user._id }, { password: hashedPassword });

  // Інвалідовуємо (видаляємо) всі можливі попередні сесії користувача
  await Session.deleteMany({ userId: user._id });

  // Повертаємо успішну відповідь
  res.status(200).json({
    message: 'Password reset successfully',
  });
};
// =======================================================================================
