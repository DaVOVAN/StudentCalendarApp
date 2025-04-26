    // src/styles/theme.ts
    import { StyleSheet } from 'react-native';
    import { Theme } from '../types/types';

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
