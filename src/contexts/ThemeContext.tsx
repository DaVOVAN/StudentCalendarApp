    // src/contexts/ThemeContext.tsx
    import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
    import { Theme } from '../types/types';
    import { applyTheme } from '../utils/theme';
    import { getThemeStyles, getThemeColors } from '../styles/theme'; // Импорт стилей

    interface ThemeContextType {
      theme: Theme;
      setTheme: (theme: Theme) => void;
      styles: any; // Добавляем стили в контекст
      colors: any; // Добавляем цвета в контекст
    }

    const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

    export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
      const [theme, setTheme] = useState<Theme>('light');
      const styles = getThemeStyles(theme); // Получаем стили для текущей темы
      const colors = getThemeColors(theme);


      const handleSetTheme = useCallback(
        (newTheme: Theme) => {
          setTheme(newTheme);
          applyTheme(newTheme); // This function now just updates app styles.
        },
        []
      );

      const contextValue: ThemeContextType = {
        theme,
        setTheme: handleSetTheme,
        styles, // Передаем стили в контекст
        colors,
      };

      return (
        <ThemeContext.Provider value={contextValue}>
          {children}
        </ThemeContext.Provider>
      );
    };

    export const useTheme = () => {
        const context = useContext(ThemeContext);
        if (!context) {
          throw new Error("useTheme must be used within a ThemeProvider");
        }
        return context;
      };
