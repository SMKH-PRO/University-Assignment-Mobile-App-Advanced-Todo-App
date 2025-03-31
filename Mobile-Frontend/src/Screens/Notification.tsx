import React, {useState, useEffect, useCallback, useRef} from 'react';
import {View, StyleSheet, ScrollView, FlatList} from 'react-native';
import {
  Header,
  NotificationCard,
  Toast,
  EmptyComponent,
  Loading,
} from './../Components';
import {useDispatch, useSelector} from 'react-redux';
import {ADD_NOTIFICATIONS} from '../Redux/Types';
import {GET_NOTIFICATIONS} from '../Constants';
import {useFocusEffect} from '@react-navigation/native';
import axios from './../Utils/axios';
import {Divider} from 'react-native-paper';
import DropdownAlert, { DropdownAlertData, DropdownAlertType } from 'react-native-dropdownalert';
const Notification = () => {
  let alert = (data?: DropdownAlertData) => new Promise<DropdownAlertData>(res => res(data || {}));
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const notifications = useSelector(
    state => state.notificationReducer.notifications,
  );
  const getNotifications = async (refresh) => {
    try {
      if(refresh) {
        setRefreshing(true);
      }
      const req = await axios({
        url: GET_NOTIFICATIONS,

        method: 'GET',
      });
      setLoading(false);
      setRefreshing(false);
      dispatch({type: ADD_NOTIFICATIONS, payload: req.data});
    } catch (error: any) {
      setRefreshing(false);
      await alert({
        type: DropdownAlertType.Error,
        title: 'Error',
        message: error?.message || 'An error occurred',
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (notifications) {
        setLoading(false);
      }
      getNotifications();
    }, []),
  );
  // console.log(image ? (image?.uri ? image : {uri: image}) : USER_IMAGE);

  const sorted = notifications?.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() ||
      a.status.localeCompare(b.status),
  );
  return (
    <View style={styles.container}>
      <Header title="Notifications" />
      {loading ? (
        <Loading />
      ) : (
        <>
          <FlatList
            data={sorted}
            contentContainerStyle={{flexGrow: 1, marginTop: 10}}
            renderItem={({item}) => <NotificationCard data={item} />}
            keyExtractor={item => item._id}
            ListEmptyComponent={() => <EmptyComponent />}
            ItemSeparatorComponent={() => <Divider />}
            refreshing={refreshing}
            onRefresh={() => getNotifications(true)}
          />
        </>
      )}
      <DropdownAlert alert={func => (alert = func)} />
    </View>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
  },
});
