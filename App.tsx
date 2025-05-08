// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { CalendarProvider } from './src/contexts/CalendarContext';
import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import EventListScreen from './src/screens/EventListScreen';
import ViewEventScreen from './src/screens/ViewEventScreen';
import AddEventScreen from './src/screens/AddEventScreen';
import ThemeSelectionScreen from './src/screens/ThemeSelectionScreen';
import { RootStackParamList } from './src/types/navigation';


const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CalendarProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Calendar" component={CalendarScreen} />
              <Stack.Screen name="EventList" component={EventListScreen} />
              <Stack.Screen name="ViewEvent" component={ViewEventScreen} />
              <Stack.Screen name="AddEvent" component={AddEventScreen} />
              <Stack.Screen name="ThemeSelection" component={ThemeSelectionScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </CalendarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;