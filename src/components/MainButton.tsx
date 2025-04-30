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
}

const MainButton: React.FC<MainButtonProps> = ({ title, onPress, icon, style, textStyle }) => {
    const { styles, colors } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.button, style]}
            onPress={onPress}
        >
            {icon && (
                <MaterialIcons
                    name={icon}
                    size={20}
                    color={colors.text}
                    style={{ marginRight: 8 }}
                />
            )}
            <Text style={[styles.buttonText, textStyle]}>{title}</Text>
        </TouchableOpacity>
    );
};

export default MainButton;