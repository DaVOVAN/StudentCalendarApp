// src/components/AuthModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useForm, Controller, SubmitHandler, FieldErrors } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTheme } from '../contexts/ThemeContext';
import MainButton from './MainButton';
import { loginSchema, registerSchema } from '../validations/authSchemas';
import { useAuth } from '../contexts/AuthContext';
import { Alert } from 'react-native';
import { useCalendar } from '../contexts/CalendarContext';

type LoginFormData = {
  username: string;
  password: string;
};

type RegisterFormData = {
  username: string;
  password: string;
  confirmPassword: string;
};

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formKey, setFormKey] = useState(Date.now());
  const { syncCalendars } = useCalendar();

  const { control, handleSubmit, reset, formState: { errors }} = useForm<LoginFormData | RegisterFormData>({
    resolver: isRegistering 
      ? yupResolver(registerSchema as any)
      : yupResolver(loginSchema as any),
    mode: 'onBlur',
  });

  useEffect(() => {
    reset();
    setFormKey(Date.now());
  }, [isRegistering]);

const onSubmit: SubmitHandler<LoginFormData | RegisterFormData> = async (data) => {
  try {
    if (isRegistering) {
      await register(data.username, data.password);
    } else {
      await login(data.username, data.password);
    }
    await syncCalendars();
    onClose();
  } catch (error) {
    if (error instanceof Error) {
      console.error("Общая ошибка:", error.message);
    } else if (typeof error === 'object' && error !== null && 'response' in error && typeof error.response === 'object' && error.response !== null && 'status' in error.response && typeof error.response.status === 'number') {
      if (error.response.status === 409) {
        Alert.alert('Ошибка', 'Это имя пользователя уже занято');
      } else {
        Alert.alert('Ошибка', 'Не удалось выполнить регистрацию');
      }
    } else {
      console.error("Неизвестная ошибка:", error);
      Alert.alert('Ошибка', 'Произошла неизвестная ошибка');
    }
  }
};

  return (
    <Modal
      key={formKey}
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          style={[styles.content, { backgroundColor: colors.primary }]}
          activeOpacity={1}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            {isRegistering ? 'Регистрация' : 'Вход'}
          </Text>

          <View style={styles.inputContainer}>
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    { 
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: colors.secondary,
                    }
                  ]}
                  placeholder="Логин"
                  placeholderTextColor={colors.secondaryText}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="none"
                />
              )}
            />
            {errors.username && (
              <Text style={[styles.error, { color: colors.emergency }]}>
                {errors.username.message}
              </Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    { 
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: colors.secondary,
                    }
                  ]}
                  placeholder="Пароль"
                  placeholderTextColor={colors.secondaryText}
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.password && (
              <Text style={[styles.error, { color: colors.emergency }]}>
                {errors.password.message}
              </Text>
            )}
          </View>

          {isRegistering && (
            <View style={styles.inputContainer}>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        color: colors.text,
                        borderColor: colors.border,
                        backgroundColor: colors.secondary,
                      }
                    ]}
                    placeholder="Подтвердите пароль"
                    placeholderTextColor={colors.secondaryText}
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {(errors as FieldErrors<RegisterFormData>).confirmPassword && (
                <Text style={[styles.error, { color: colors.emergency }]}>
                  {(errors as FieldErrors<RegisterFormData>).confirmPassword?.message}
                </Text>
              )}
            </View>
          )}

          <MainButton
            title={isRegistering ? 'Зарегистрироваться' : 'Войти'}
            onPress={handleSubmit(onSubmit)}
            style={{ marginVertical: 12 }}
          />

          <TouchableOpacity
            onPress={() => setIsRegistering(!isRegistering)}
            style={styles.switchMode}
          >
            <Text style={{ color: colors.accent }}>
              {isRegistering 
                ? 'Уже есть аккаунт? Войти' 
                : 'Нет аккаунта? Зарегистрироваться'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '80%',
    borderRadius: 12,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
  switchMode: {
    marginTop: 12,
    alignSelf: 'center',
  },
});

export default AuthModal;