// src/validations/authSchemas.ts
import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  username: yup
    .string()
    .required('Обязательное поле')
    .min(3, 'Минимум 3 символа')
    .max(20, 'Максимум 20 символов'),
  password: yup
    .string()
    .required('Обязательное поле')
    .min(6, 'Минимум 6 символов')
    .max(50, 'Максимум 50 символов'),
});

export const registerSchema = loginSchema.concat(
  yup.object().shape({
    confirmPassword: yup
      .string()
      .required('Подтвердите пароль')
      .oneOf([yup.ref('password')], 'Пароли должны совпадать'),
  })
);