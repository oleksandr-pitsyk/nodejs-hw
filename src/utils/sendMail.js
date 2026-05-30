// Функція-утіліта відправка листа

// Імпорт з бібліотеки
import nodemailer from 'nodemailer';

// transporter створює з’єднання зі SMTP-сервером.
// nodemailer автоматично підбере безпечні налаштування відповідно до порту та відповіді сервера.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Функція відправки листа (в опціях вказуємо пізніше: from, to, html, subject)
export const sendEmail = async (options) => {
  return await transporter.sendMail(options);
};
