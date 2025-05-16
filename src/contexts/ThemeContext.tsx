// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Theme } from '../types/types';
import { getThemeStyles, getThemeColors } from '../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  styles: any;
  colors: any;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const styles = getThemeStyles(theme);
  const colors = getThemeColors(theme);

  useEffect(() => {
    const loadSavedTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('@theme');
      if (savedTheme && savedTheme !== theme) {
        setTheme(savedTheme as Theme);
      }
    };
    loadSavedTheme();
  }, []);

  const handleSetTheme = useCallback(async (newTheme: Theme) => {
    setTheme(newTheme);
    await AsyncStorage.setItem('@theme', newTheme);
  }, []);

  const contextValue: ThemeContextType = {
    theme,
    setTheme: handleSetTheme,
    styles,
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
