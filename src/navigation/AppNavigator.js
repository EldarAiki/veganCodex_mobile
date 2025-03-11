import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import WelcomeScreen from '../screens/WelcomeScreen';
import ExplorerScreen from '../screens/ExplorerScreen';
import ProductScreen from '../screens/ProductScreen';
import AddProductScreen from '../screens/AddProductScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack navigator for the Explorer tab
const ExplorerStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#4CAF50',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen 
      name="ExplorerMain" 
      component={ExplorerScreen}
      options={{ title: 'Explore Products' }}
    />
    <Stack.Screen 
      name="Product" 
      component={ProductScreen}
      options={{ title: 'Product Details' }}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Explorer') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Welcome') {
            iconName = focused ? 'log-in' : 'log-in-outline';
          } else if (route.name === 'AddProduct') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Explorer" 
        component={ExplorerStack}
        options={{ headerShown: false }}
      />
      {isAuthenticated ? (
        <>
          <Tab.Screen
            name="AddProduct"
            component={AddProductScreen}
            options={{ title: 'Add Product' }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: 'Profile' }}
          />
        </>
      ) : (
        <Tab.Screen 
          name="Welcome" 
          component={WelcomeScreen}
          options={{ title: 'Login' }}
        />
      )}
    </Tab.Navigator>
  );
};

export default AppNavigator; 