// src/screens/ThemeSelectionScreen.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../types/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { MaterialIcons } from '@expo/vector-icons';

const themes: Theme[] = ['light', 'dark', 'pink', 'ocean', 'forest', 'military'];

interface ThemeSelectionScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'ThemeSelection'>;
}

const ThemeSelectionScreen: React.FC<ThemeSelectionScreenProps> = ({ navigation }) => {
  const { setTheme, colors } = useTheme();

  const renderThemeItem = ({ item }: { item: Theme }) => {
    const themeColors = getThemeColorsPreview(item);
    
    return (
      <TouchableOpacity
        style={[styles.themeCard, { backgroundColor: colors.secondary }]}
        onPress={() => {
          setTheme(item);
          navigation.goBack();
        }}
      >
        <Text style={[styles.themeName, { color: colors.text }]}>{item}</Text>
        <View style={styles.colorsContainer}>
          {Object.entries(themeColors).map(([name, color]) => (
            <View key={name} style={[styles.colorSquare, { backgroundColor: color }]} />
          ))}
        </View>
        <MaterialIcons name="check-circle" size={24} color={colors.accent} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <FlatList
        data={themes}
        renderItem={renderThemeItem}
        keyExtractor={(item) => item}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
};

const getThemeColorsPreview = (theme: Theme) => {
  const colors = {
    light: ['#F8F9FA', '#2B2D42', '#D1D1E2'],
    dark: ['#1A1B26', '#A9B1D6', '#364181'],
    pink: ['#FFF0F5', '#6D2E46', '#E871A1'],
    ocean: ['#E6F4F1', '#2A4A5F', '#3A7CA5'],
    forest: ['#F0F4EF', '#354F52', '#729871'],
    military: ['#F0F4EF', '#364733', '#6B9080' ]
  };
  return colors[theme];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  grid: {
    justifyContent: 'space-between',
  },
  themeCard: {
    width: '45%',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  themeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  colorsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  colorSquare: {
    width: 32,
    height: 32,
    marginHorizontal: 4,
    borderRadius: 6,
  },
});

export default ThemeSelectionScreen;