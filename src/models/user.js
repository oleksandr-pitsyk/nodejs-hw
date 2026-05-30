// Схема та модель для колекції "user" у MongoDB

// Імпорт Schema та model
import { Schema, model } from 'mongoose';

//  CСхема для моделі User із такими властивостями:
//    username — рядок, не обов’язкове поле, з параметром trim: true;
//    email — рядок, унікальне, обов’язкове, з параметром trim: true;
//    password — рядок, обов’язкове, мінімальна довжина — 8 символів.

const userSchema = new Schema(
  {
    username: {
      type: String, // тип - рядок
      trim: true, // прибирає пробіли на початку та в кінці рядка
    },
    email: {
      type: String, // тип - рядок
      unique: true, // має бути унікальне значення в БД
      required: true, // поле обов'язкове для заповнення
      trim: true, // прибирає пробіли на початку та в кінці рядка
    },
    password: {
      type: String, // тип - рядок
      required: true, // поле обов'язкове для заповнення
    },
    avatar: {
      type: String, // тип - рядок
      required: false, // поле НЕ обов'язкове для заповнення
      default: 'https://ac.goit.global/fullstack/react/default-avatar.jpg', // значення за замовчуванням
    },
  },
  {
    timestamps: true, // автоматично додає createdAt і updatedAt
    versionKey: false, // вимикає службове поле __v
  },
);

// За замовчуванням імя користувача буде дорівнювати email користувача.
// Для цього ми використовуємо pre-hook Schema.pre("save"), який виконується перед збереженням користувача.
userSchema.pre('save', async function () {
  if (!this.username) {
    this.username = this.email;
  }
});

// Перевизначаємо метод toJSON,
// щоб при виклику перетворення відповіді res.json() з об'єкту видалявся пароль
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Створюємо модель згідно схеми
export const User = model('User', userSchema);
