//App.tsx
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { LogBox, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from './src/contexts/ThemeContext';
import CalendarMembersScreen from './src/screens/CalendarMembersScreen';
import CalendarSettingsScreen from './src/screens/CalendarSettingsScreen';
import AppSettingsScreen from './src/screens/AppSettingsScreen';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Sending `onAnimatedValueUpdate` with no listeners registered'
]);

const Stack = createStackNavigator<RootStackParamList>();

const CustomHeader = ({ navigation, route }: any) => {
  const { colors } = useTheme();

  return (
      <View style={[styles.headerContainer, { backgroundColor: colors.primary }]}>
        <View style={styles.headerContent}>
          {route.name === 'Home' ? (
            <TouchableOpacity onPress={handleExitApp} style={styles.button}>
              <MaterialIcons name="exit-to-app" size={24} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.button}>
              <MaterialIcons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.button}>
            <MaterialIcons name="home" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.separator, { 
          backgroundColor: colors.border,
          marginHorizontal: route.name === 'Home' ? 0 : 16 
        }]} />
      </View>
  );
};

  const handleExitApp = () => {
    BackHandler.exitApp();
  };

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <CalendarProvider>
              <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                <NavigationContainer>
                  <Stack.Navigator
                    initialRouteName="Home"
                    screenOptions={{
                      header: (props) => <CustomHeader {...props} />,
                      cardStyle: { backgroundColor: '#FFFFFF' }
                    }}
                  >
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="Calendar" component={CalendarScreen} />
                    <Stack.Screen name="EventList" component={EventListScreen} />
                    <Stack.Screen name="ViewEvent" component={ViewEventScreen} />
                    <Stack.Screen name="AddEvent" component={AddEventScreen} />
                    <Stack.Screen name="ThemeSelection" component={ThemeSelectionScreen} />
                    <Stack.Screen name="CalendarMembers" component={CalendarMembersScreen} />
                    <Stack.Screen name="CalendarSettings" component={CalendarSettingsScreen} />
                    <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
                  </Stack.Navigator>
                </NavigationContainer>
              </SafeAreaView>
            </CalendarProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
    headerContainer: {
    borderBottomWidth: 0
  },
  headerContent: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16
  },
  button: {
    padding: 8
  },
    separator: {
    height: 2,
    width: '90%',
    alignSelf: 'center',
    marginTop: -2
  }
});

export default App;