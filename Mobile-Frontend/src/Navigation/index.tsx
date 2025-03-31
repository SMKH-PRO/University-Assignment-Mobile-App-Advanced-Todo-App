// In App.js in a new project

import React, {useState, useEffect, useLayoutEffect} from 'react';
import {View, Text, Platform, AppState} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import SplashScreen from 'react-native-splash-screen';

import {ROUTES, HOME_PATH} from './Routes';
import { useAppSelector, useAppDispatch } from '../Redux/hooks';
import CustomDrawerContent from './CustomDrawer';
import {Toast} from '../Components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from './../Utils/axios';
import {ADD_HOME_FILTERS} from '../Redux/Types';
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function Navigation() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state?.userReducer?.user);
  const homeFilters = useAppSelector(state => state?.metaReducer?.homeFilters);
  const homeCounter = useAppSelector(state => state?.tourReducer?.homeCounter);

  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    onKill();
  }, []);

  const onKill = async () => {
    const heheh = await dispatch({
      type: ADD_HOME_FILTERS,
      payload: null,
    });

    setLoading(false);
    console.log('RESRT BIG', heheh);
  };

  useEffect(() => {
    resetNetworkError();
    SplashScreen.hide();
  }, []);

  const resetNetworkError = async () => {
    try {
      await AsyncStorage.removeItem('@network-error');
    } catch (err) {
      console.log('');
    }
  };

  return (
    <NavigationContainer>
      {loading ? (
        <View />
      ) : user ? (
        <Drawer.Navigator
          screenOptions={{headerShown: false}}
          initialRouteName="Home"
          drawerContent={props => <CustomDrawerContent {...props} />}>
          {ROUTES?.filter(v => v.authRequired === Boolean(user)).map(
            (route, index) => (
              <Drawer.Screen
                key={index}
                name={route.path}
                component={route.path === HOME_PATH ? Root : route.component}
              />
            ),
          )}
        </Drawer.Navigator>
      ) : (
        <Root />
      )}
    </NavigationContainer>
  );
}

function Root() {
  const user = useAppSelector(state => state?.userReducer?.user);
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {ROUTES?.filter(v => v.authRequired === Boolean(user)).map(
        (route, index) => (
          <Stack.Screen
            key={index}
            name={route.path}
            component={route.component}
          />
        ),
      )}
    </Stack.Navigator>
  );
}
export default Navigation;
