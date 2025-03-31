import React, {useEffect, useState} from 'react';
import {
  View,
  useWindowDimensions,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import {useTheme, Avatar, Text, IconButton} from 'react-native-paper';
import LOGOUT_IMAGE from './../Assets/Images/logout.png';
import TERMS_IMAGE from './../Assets/Images/terms.png';
import PRIVACY_IMAGE from './../Assets/Images/privacy.png';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import {useSelector, useDispatch} from 'react-redux';
import {
  GOALS_PATH,
  HOME_PATH,
  LOGIN_PATH,
  PROFILE_PATH,
  ROUTES,
} from './Routes';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
  ADD_USER,
  ADD_PENDING_SUBJECTS,
  ADD_GOALS,
  ADD_ASSIGNMENTS,
  HOME_TOUR_COUNTER,
  GOAL_TOUR_COUNTER,
  ADD_TODAY_ASSIGNMENTS,
  ADD_HOME_FILTERS,
} from '../Redux/Types';
import {useNavigation} from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import DIRECTION_IMAGE from '../Assets/Images/direction.png';

import USER_IMAGE from './../Assets/Images/user.png';
import {CustomButton} from '../Components';

function CustomDrawerContent(props) {
  const theme = useTheme();
  const navigation = props.navigation;
  const dispatch = useDispatch();
  const primaryColor = theme.colors.primary;
  const iconColor = theme.colors.icon;
  const [currentScreen, setCurrentScreen] = useState(
    props?.state?.routeNames?.[props?.state?.index],
  );

  const isDrawerOpen = props.state.history.some(it => it.type === 'drawer');

  const tourVisible =
    currentScreen === HOME_PATH || currentScreen === GOALS_PATH;
  const height = useWindowDimensions().height;
  const user = useSelector(state => state?.userReducer?.user);
  const meta = useSelector(state => state?.metaReducer?.meta);
  const homeCounter = useSelector(state => state?.tourReducer?.homeCounter);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@token');
    dispatch({
      type: ADD_PENDING_SUBJECTS,
      payload: null,
    });
    dispatch({
      type: ADD_TODAY_ASSIGNMENTS,
      payload: null,
    });
    dispatch({
      type: ADD_HOME_FILTERS,
      payload: null,
    });
    dispatch({
      type: ADD_GOALS,
      payload: null,
    });

    dispatch({
      type: ADD_ASSIGNMENTS,
      payload: null,
    });

    dispatch({
      type: ADD_USER,
      payload: null,
    });
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: 'Home' },
         ],
      }),
    );

    navigation.closeDrawer();
  };

  const customTab = (title, image, onPress) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.icon}>
        <Image source={image} style={{width: 15, height: 15}} />
      </View>
      <Text style={[styles.menuText, {color: '#222'}]}>{title}</Text>
    </TouchableOpacity>
  );

  const getActiveRouteName = state => {
    const route = state.routes[state.index];
    if (route.state) {
      return getActiveRouteName(route.state);
    }
    return route.name;
  };

  const handleTourReset = () => {
    navigation.closeDrawer();
    setTimeout(() => {
      if (getActiveRouteName(props.state) == GOALS_PATH) {
        dispatch({type: HOME_TOUR_COUNTER, payload: 69});
      } else {
        dispatch({type: HOME_TOUR_COUNTER, payload: 2});
      }
    }, 500);
  };

  useEffect(() => {
    console.log(
      'OPOPOP DERAWER',
      isDrawerOpen,
      homeCounter,
      homeCounter === 1 && isDrawerOpen,
    );
  }, [isDrawerOpen]);

  const handleLink = type => {
    const url = meta?.[type];
    if (url) {
      Linking.openURL(url).catch(err => {
        console.log('Failed opening page because: ', err);
      });
    } else {
      console.log("Don't know how to open URI: " + url);
    }
  };

  const userName = user?.firstName + ' ' + user?.lastName;
  return (
    <DrawerContentScrollView
      {...props}
      style={{minHeight: height, marginTop: -5}}>
      <View style={[styles.menuContainer, {minHeight: height}]}>
        <View style={styles.header}>
          <View style={styles.imageContainer}>
            <Avatar.Image
              label={user?.lastName?.[0]}
              size={35}
              source={user?.imageUrl ? {uri: user?.imageUrl} : USER_IMAGE}
              style={{backgroundColor: 'lightgray'}}
            />
          </View>
          <View style={styles.textContainer}>
            {user?.email && <Text style={styles.email}>{user?.email}</Text>}
            <Text style={styles.name}>
              {userName?.length <= 24
                ? `${userName}`
                : `${userName.substring(0, 24)}...`}
            </Text>
          </View>
          <View style={styles.imageContainer}>
            <IconButton
              icon={() => (
                <FontAwesome
                  name="pencil-square-o"
                  size={16}
                  color={primaryColor}
                />
              )}
              color={primaryColor}
              onPress={() => navigation.navigate(PROFILE_PATH)}
            />
          </View>
        </View>
        {ROUTES?.filter(
          v => v.authRequired === Boolean(user) && v.showInSidebar,
        ).map(route => {
          return (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                navigation.navigate(HOME_PATH, {
                  screen: route.path,
                });
                }}>
              <View style={styles.icon}>
                <Image
                  source={route.image}
                  style={{width: 15, height: 15, resizeMode: 'contain'}}
                />
              </View>
              <Text style={[styles.menuText, {color: '#222'}]}>
                {route.path}
              </Text>
            </TouchableOpacity>
          );
        })}
        {customTab('Terms & Conditions', TERMS_IMAGE, () => handleLink('term'))}
        {customTab('Privacy Policy', PRIVACY_IMAGE, () =>
          handleLink('privacy'),
        )}
        {customTab('Logout', LOGOUT_IMAGE, handleLogout)}
      </View>
    </DrawerContentScrollView>
  );
}

export default CustomDrawerContent;

const styles = StyleSheet.create({
  menuContainer: {
    flexGrow: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  menuItem: {
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    margin: 0,
    marginRight: 10,
    padding: 0,
    marginTop: -2,
  },
  menuText: {
    fontSize: 15,
    fontFamily: 'AvenirArabic-Medium',
  },
  header: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    alignItems: 'center',
  },
  name: {fontSize: 12, fontFamily: 'AvenirArabic-Heavy'},
  email: {fontSize: 10},
});
