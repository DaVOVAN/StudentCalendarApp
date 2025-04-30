// src/types/vector-icons.d.ts
declare module '@expo/vector-icons' {
    type IconName = keyof typeof MaterialIcons.glyphMap;
    export { MaterialIcons, IconName };
  }