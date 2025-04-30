// src/components/MainButton.tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface MainButtonProps {
    title: string;
    onPress: () => void;
    icon?: keyof typeof MaterialIcons.glyphMap; // Автодополнение имён иконок
}

const MainButton: React.FC<MainButtonProps> = ({ title, onPress, icon }) => {
    const { styles, colors } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.button, { flexDirection: 'row', alignItems: 'center' }]}
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
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
};

export default MainButton;