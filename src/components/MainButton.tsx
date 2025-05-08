// src/components/MainButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface MainButtonProps {
  title: string;
  onPress: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  iconSize?: number;
  iconPosition?: 'left' | 'right';
}

const MainButton: React.FC<MainButtonProps> = ({ 
  title, 
  onPress, 
  icon, 
  style, 
  textStyle, 
  disabled = false,
  iconSize = 20,
  iconPosition = 'left'
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: colors.accent,
          padding: 12,
          borderRadius: 8,
          alignItems: 'center',
          flexDirection: iconPosition === 'right' ? 'row-reverse' : 'row',
          justifyContent: 'center',
          opacity: disabled ? 0.6 : 1,
        },
        style
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      {icon && (
        <MaterialIcons
          name={icon}
          size={iconSize}
          color={colors.accentText}
          style={{
            marginRight: iconPosition === 'left' ? 8 : 0,
            marginLeft: iconPosition === 'right' ? 8 : 0
          }}
        />
      )}
      <Text style={[
        {
          color: colors.accentText,
          fontSize: 16,
          fontWeight: '500',
        },
        textStyle
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default MainButton;