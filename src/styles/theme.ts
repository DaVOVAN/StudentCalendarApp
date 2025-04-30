    // src/styles/theme.ts
    import { StyleSheet } from 'react-native';
    import { Theme } from '../types/types';

    export const getThemeColors = (theme: Theme) => {
      switch (theme) {
          case 'dark':
              return {
                  primary: '#1A1A1A',
                  secondary: '#2D2D2D',
                  text: '#FFFFFF',
                  accent: '#BB86FC',
              };
          case 'pink':
              return {
                  primary: '#FFF0F5',
                  secondary: '#FFB6C1',
                  text: '#4B0082',
                  accent: '#FF69B4',
              };
          case 'ocean':
              return {
                  primary: '#E0F7FA',
                  secondary: '#80DEEA',
                  text: '#006064',
                  accent: '#00BCD4',
              };
          case 'forest':
              return {
                  primary: '#E8F5E9',
                  secondary: '#A5D6A7',
                  text: '#1B5E20',
                  accent: '#4CAF50',
              };
          default: // light
              return {
                  primary: '#FFFFFF',
                  secondary: '#F5F5F5',
                  text: '#212121',
                  accent: '#6200EE',
              };
      }
  };

    export const getThemeStyles = (theme: Theme) => {
        const colors = getThemeColors(theme);

        return StyleSheet.create({
            button: {
                backgroundColor: colors.secondary,
                padding: 10,
                borderRadius: 5,
            },
            buttonText: {
                color: colors.text,
            },
            label: {
                color: colors.text,
                fontSize: 16,
            },
        });
    };
