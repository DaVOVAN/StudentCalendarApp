//src/utils/theme.ts
import { Theme } from '../types/types';
import { StyleSheet } from 'react-native';

export const getThemeColors = (theme: Theme) => {
    switch (theme) {
      case 'dark':
        return {
          primary: '#2E2E2E',
          secondary: '#404040',
          text: '#FFFFFF',
        };
      case 'pink':
        return {
          primary: '#FFB6C1',
          secondary: '#FF69B4',
          text: '#4B0082',
        };
      default:
        return {
          primary: '#FFFFFF',
          secondary: '#F0F0F0',
          text: '#000000',
        };
    }
  };

export const themedStyles = (theme: Theme) => {
    const colors = getThemeColors(theme);
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.primary,
        },
        text: {
            color: colors.text,
        },
        // Add more styles as needed
    });
};

export const applyTheme = (theme: Theme) => {
    // You might dispatch an action to update Redux/Context state here if you're using a state management library
    console.log('Applied theme:', theme);
};