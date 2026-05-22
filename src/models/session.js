// Схема та модель для колекції "session" у MongoDB

// Імпорт Schema та model
import { Schema, model } from 'mongoose';

// Cтворення схеми для моделі Session із такими властивостями:
//    userId — тип Schema.Types.ObjectId, обов’язкове, посилання на модель User;
//    accessToken — рядок, обов’язкове;
//    refreshToken — рядок, обов’язкове;
//    accessTokenValidUntil — тип Date, обов’язкове;
//    refreshTokenValidUntil — тип Date, обов’язкове.
const sessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: 'User',
    },
    accessToken: {
      type: String,
      require: true,
    },
    refreshToken: {
      type: String,
      require: true,
    },
    accessTokenValidUntil: {
      type: Date,
      require: true,
    },
    refreshTokenValidUntil: {
      type: Date,
      require: true,
    },
  },
  {
    timestamps: true, // автоматично додає createdAt і updatedAt
    versionKey: false, // вимикає службове поле __v
  },
);

// Створення моделі Session
export const Session = model('Session', sessionSchema);
