import React, {useEffect, useState, useCallback} from 'react';
import {Appbar, useTheme, Title} from 'react-native-paper';
import {StyleSheet, Text, View} from 'react-native';

import {useNavigation, useFocusEffect} from '@react-navigation/native';

import {useSelector, useDispatch} from 'react-redux';
import {ADD_NOTIFICATIONS} from '../Redux/Types';

import {GET_NOTIFICATIONS} from '../Constants';
import axios from './../Utils/axios';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';

const Header = ({
  title,
  elevation = 1,
  onBackBtn,
  iconRight = 'close',
  iconLeft = 'menu',
  onLeftBtn,
  hasLeftBtn = false,
  showNotification = false,
  copilot = {},
}) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const navigation = useNavigation();
  const iconColor = theme.colors.icon;
  const primaryColor = theme.colors.primary;
  const notifications = useSelector(
    state => state.notificationReducer.notifications,
  );

  const [filteredNotification, setFilteredNotification] = useState([]);
  const getNotifications = async () => {
    try {
      const req = await axios({
        url: GET_NOTIFICATIONS,

        method: 'GET',
      });
      const filterNotification = req.data?.filter(v => v.status == 'active');
      setFilteredNotification(filterNotification);
      dispatch({type: ADD_NOTIFICATIONS, payload: req.data});
    } catch (error) {
      console.log('error', 'Error', error?.message);
    }
  };
  useFocusEffect(
    useCallback(() => {
      getNotifications();
    }, []),
  );

  return (
    <Appbar.Header
      style={[styles.container, {elevation}]}
      statusBarHeight={2}
      {...copilot}>
      {hasLeftBtn && (
        <Appbar.Action
          icon={iconLeft}
          color={iconColor}
          onPress={
            onLeftBtn ? () => onLeftBtn() : () => navigation.toggleDrawer()
          }
        />
      )}
      <Appbar.Content title={<Text style={styles.title}>{title}</Text>} />
      <Appbar.Action
        icon={
          typeof iconRight === 'function'
            ? iconRight
            : () => (
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <MaterialCommunityIcons
                    name={iconRight}
                    size={20}
                    color={iconColor}
                  />
                  {showNotification && Boolean(filteredNotification.length) && (
                    <Entypo
                      name="dot-single"
                      color={primaryColor}
                      size={20}
                      style={{marginTop: -5, marginLeft: -12}}
                    />
                  )}
                </View>
              )
        }
        color={iconColor}
        animated={false}
        onPress={onBackBtn ? () => onBackBtn() : () => navigation.goBack()}
      />
    </Appbar.Header>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    // fontWeight: 'bold',
    fontFamily: 'AvenirArabic-Heavy',
  },
});
