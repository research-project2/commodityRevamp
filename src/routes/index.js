import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import theme from '../theme';

// Import Screens
import SignInScreen from '../screens/SignIn';
import SignUpScreen from '../screens/SignUpSimple';
import HomeScreen from '../screens/Home';
import AllCommodityScreen from '../screens/AllCommodity';
import DetailCommodityScreen from '../screens/AllCommodity/component/DetailCommodity';

const Stack = createNativeStackNavigator();

// Auth Stack - SignIn & SignUp
export const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
      initialRouteName="SignIn"
    >
      <Stack.Screen 
        name="SignIn" 
        component={SignInScreen}
      />
      <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen}
      />
    </Stack.Navigator>
  );
};

// App Stack - Home & Commodity
export const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
      initialRouteName="Home"
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          animationTypeForReplace: 'pop',
        }}
      />
      <Stack.Screen 
        name="AllCommodity" 
        component={AllCommodityScreen}
      />
      <Stack.Screen 
        name="CommodityDetail" 
        component={DetailCommodityScreen}
      />
    </Stack.Navigator>
  );
};

// Root Navigator - Handle Auth Logic
export const RootNavigator = ({ isLoggedIn }) => {
  return isLoggedIn ? <AppStack /> : <AuthStack />;
};

export default RootNavigator;