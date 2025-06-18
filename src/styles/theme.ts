// src/styles/theme.ts
import { StyleSheet } from 'react-native';
import { Theme } from '../types/types';

export const getThemeColors = (theme: Theme) => {
  switch (theme) {
    // Современная светлая тема
    case 'light':
      return {
        primary: '#F8F9FA',
        secondary: '#E9ECEF',
        text: '#2B2D42',
        accent: '#D1D1E2',
        accentText: '#FFFFFF',
        secondaryText: '#6C757D',
        calendarDayBackground: '#FFFFFF', 
        calendarOtherMonth: '#DEE2E6',
        emergency: '#828CAB',
        modalOverlay: 'rgba(222, 226, 230, 0.8)',
        buttonHover: '#CED4DA',
        border: '#ADB5BD'
      };

    // Утончённая тёмная тема
    case 'dark':
      return {
        primary: '#1A1B26',
        secondary: '#24283B',
        text: '#A9B1D6',
        accent: '#364181',
        accentText: '#D2D2D2',
        secondaryText: '#565F89', 
        calendarDayBackground: '#2D3047',
        calendarOtherMonth: '#1E2030',
        emergency: '#116588',
        modalOverlay: 'rgba(30, 32, 48, 0.95)',
        buttonHover: '#343B58',
        border: '#414868'
      };

    // Пастельная розовая тема
    case 'pink':
      return {
        primary: '#FFF0F5',
        secondary: '#FFE4E9',   
        text: '#6D2E46',
        accent: '#E871A1',
        accentText: '#FFF0F5',
        secondaryText: '#9F6B7E',
        calendarDayBackground: '#FFFAFB',
        calendarOtherMonth: '#F8D7E3',
        emergency: '#ff85a3',
        modalOverlay: 'rgba(255, 220, 227, 0.85)',
        buttonHover: '#FFC2D6',
        border: '#E8B4C8',
      };

    // Глубокий океан
    case 'ocean':
      return {
        primary: '#E6F4F1',
        secondary: '#B8E1DD',   
        text: '#2A4A5F',
        accent: '#3A7CA5',
        accentText: '#FFFFFF',
        secondaryText: '#5C8A9F',
        calendarDayBackground: '#D4EDF4',
        calendarOtherMonth: '#A2C4D9',
        emergency: '#368ceb',
        modalOverlay: 'rgba(168, 218, 220, 0.9)',
        buttonHover: '#89C2D9',
        border: '#61A5C2'
      };

    // Природная зелень
    case 'forest':
      return {
        primary: '#F0F4EF',
        secondary: '#D4E2D4',   
        text: '#354F52',
        accent: '#588157',
        accentText: '#F0F4EF',
        secondaryText: '#6B9080',
        calendarDayBackground: '#E3E9D3',
        calendarOtherMonth: '#B6C2A1',
        emergency: '#2ead2b',
        modalOverlay: 'rgba(195, 213, 187, 0.9)',
        buttonHover: '#A3B18A',
        border: '#84A98C'
      };

    // Военный
    case 'military':
      return {
        primary: '#F0F4EF',
        secondary: '#DADCD5',   
        text: '#364733',
        accent: '#364733',
        accentText: '#DADCD5',
        secondaryText: '#6B9080',
        calendarDayBackground: '#E0D9C8',
        calendarOtherMonth: '#C5BDA9',
        emergency: '#5c6d4e',
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
      picker: {
            backgroundColor: colors.secondary,
            color: colors.text,
        },
        pickerItem: {
            backgroundColor: colors.secondary,
            color: colors.text,
        },
        button: {
            backgroundColor: colors.accent,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginVertical: 4,
        },
        buttonText: {
            color: colors.accentText,
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