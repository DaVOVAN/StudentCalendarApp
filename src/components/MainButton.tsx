// src/components/MainButton.tsx
    import React from 'react';
    import { TouchableOpacity, Text, StyleSheet } from 'react-native';
    import { useTheme } from '../contexts/ThemeContext';

    interface MainButtonProps {
        title: string;
        onPress: () => void;
    }

    const MainButton: React.FC<MainButtonProps> = ({ title, onPress }) => {
        const { styles } = useTheme(); // Получаем стили из контекста

        return (
            <TouchableOpacity style={styles.button} onPress={onPress}>
                <Text style={styles.buttonText}>{title}</Text>
            </TouchableOpacity>
        );
    };

    export default MainButton;