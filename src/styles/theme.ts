// src/styles/theme.ts
import { StyleSheet } from 'react-native';
import { Theme } from '../types/types';

export const getThemeColors = (theme: Theme) => {
  switch (theme) {
    // Современная светлая тема (Nordic)
    case 'light':
      return {
        primary: '#F8F9FA',    // Светло-серый фон
        secondary: '#E9ECEF', // Вторичный фон
        text: '#2B2D42',      // Темно-синий текст
        accent: '#4A4E69',    // Акцентный цвет
        secondaryText: '#6C757D', // Серый текст
        calendarDayBackground: '#FFFFFF', 
        calendarOtherMonth: '#DEE2E6',
        emergency: '#EF233C', // Ярко-красный
        modalOverlay: 'rgba(222, 226, 230, 0.8)',
        buttonHover: '#CED4DA',
        border: '#ADB5BD'
      };

    // Утончённая тёмная тема (Midnight)
    case 'dark':
      return {
        primary: '#1A1B26',     // Глубокий сине-черный
        secondary: '#24283B',   // Оттенок хаки
        text: '#A9B1D6',        // Мягкий лавандовый
        accent: '#7AA2F7',      // Неоново-синий
        secondaryText: '#565F89', 
        calendarDayBackground: '#2D3047',
        calendarOtherMonth: '#1E2030',
        emergency: '#F7768E',   // Неоново-розовый
        modalOverlay: 'rgba(30, 32, 48, 0.95)',
        buttonHover: '#343B58',
        border: '#414868'
      };

    // Пастельная розовая тема (Cotton Candy)
    case 'pink':
      return {
        primary: '#FFF0F5',     // Розовая вата
        secondary: '#FFE4E9',   
        text: '#6D2E46',        // Тёмная роза
        accent: '#E75480',      // Ягодный акцент
        secondaryText: '#9F6B7E',
        calendarDayBackground: '#FFFAFB',
        calendarOtherMonth: '#F8D7E3',
        emergency: '#FF3366',   // Яркий фуксия
        modalOverlay: 'rgba(255, 220, 227, 0.85)',
        buttonHover: '#FFC2D6',
        border: '#E8B4C8'
      };

    // Глубокий океан (Abyss)
    case 'ocean':
      return {
        primary: '#E6F4F1',     // Морская пена
        secondary: '#B8E1DD',   
        text: '#2A4A5F',        // Глубокий синий
        accent: '#3A7CA5',      // Аквамарин
        secondaryText: '#5C8A9F',
        calendarDayBackground: '#D4EDF4',
        calendarOtherMonth: '#A2C4D9',
        emergency: '#E63946',   // Коралловый
        modalOverlay: 'rgba(168, 218, 220, 0.9)',
        buttonHover: '#89C2D9',
        border: '#61A5C2'
      };

    // Природная зелень (Forest)
    case 'forest':
      return {
        primary: '#F0F4EF',     // Светло-салатовый
        secondary: '#D4E2D4',   
        text: '#354F52',        // Тёмный хвойный
        accent: '#588157',      // Зелёный мох
        secondaryText: '#6B9080',
        calendarDayBackground: '#E3E9D3',
        calendarOtherMonth: '#B6C2A1',
        emergency: '#D64933',   // Тыквенный
        modalOverlay: 'rgba(195, 213, 187, 0.9)',
        buttonHover: '#A3B18A',
        border: '#84A98C'
      };

    default:
      return {} as never;
  }
};

export const getThemeStyles = (theme: Theme) => {
    const colors = getThemeColors(theme);

    return StyleSheet.create({
        button: {
            backgroundColor: colors.accent,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginVertical: 4,
        },
        buttonText: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '500',
        },
        input: {
            borderWidth: 1,
            borderColor: colors.secondaryText,
            borderRadius: 8,
            padding: 12,
            color: colors.text,
            marginVertical: 8,
        },
    });
};