// ===================================================================================
// Утиліта для завантаження файлів
// функція saveFileToCloudinary, яка отримає файл і завантажить його у Cloudinary
// ===================================================================================
// Імпорт бібліотеки для роботи з хмарним сховищем cloudinary
import { v2 as cloudinary } from 'cloudinary';

// Конфігурація Cloudinary: виконується через cloudinary.config(), де ми вказуємо ключі з .env.
cloudinary.config({
  secure: true,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function saveFileToCloudinary(buffer, userId) {
  const options = {
    folder: 'notehub/avatars',
    public_id: `avatar_${userId}`,
    resource_type: 'image',
    overwrite: true,
    unique_filename: false,
    transformation: [
      { width: 500, height: 500, crop: 'fill', gravity: 'auto' },
      { fetch_format: 'auto', quality: 'auto' },
    ],
  };

  // Promise: функція обгорнута у проміс, щоб можна було зручно використовувати await в місці виклику.
  // Якщо завантаження успішне — повертається результат з усією інформацією про файл, якщо помилка - вона передається у reject.

  return new Promise((resolve, reject) => {
    // upload_stream: створюється і налаштовується потік для завантаження, куди можна передати вміст файлу.
    // Метод cloudinary.uploader.upload_stream(...) створює записувальний потік (Writable stream).
    // Writable потік — це приймач, який:
    //    отримує дані (байти зображення);
    //    відправляє їх у Cloudinary API;
    //    сигналізує, коли прийом завершено або сталася помилка.
    // upload_stream — це такий “вхідний порт” у Cloudinary, який чекає, що ви в нього “наллєте” байти зображення.
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    });

    // uploadStream.end(buffer): передає буфер із зображенням до потоку для завантаження у Cloudinary.
    uploadStream.end(buffer);
  });
}
