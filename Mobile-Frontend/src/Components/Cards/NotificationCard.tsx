import React from 'react';

import {Text, useTheme, Divider, Checkbox} from 'react-native-paper';

import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  ASSIGNMENT_DETAILS_PATH,
  GOAL_DETAILS_PATH,
} from '../../Navigation/Routes';
const NotificationCard = ({data, selected}) => {
  const theme = useTheme();

  const primaryColor = theme.colors.primary;

  const navigation = useNavigation();
  const {title, body, assignment, _id, status, goal} = data;
  console.log(status);
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        navigation.navigate(
          data.type === 'Goal' ? GOAL_DETAILS_PATH : ASSIGNMENT_DETAILS_PATH,
          {
            assignmentId: data.type === 'Goal' ? goal?._id : assignment?._id,
            notificationId: _id,
          },
        )
      }>
      <View style={styles.titleCont}>
        <Text
          style={[styles.title, status === 'active' && {color: primaryColor}]}>
          {title}
        </Text>
      </View>
      {Boolean(body) && <Text style={styles.subtitle}>{body}</Text>}
    </TouchableOpacity>
  );
};

export default NotificationCard;

const styles = StyleSheet.create({
  container: {
    marginVertical: 3,
    marginHorizontal: 10,
    padding: 5,
    // backgroundColor: 'pink',
  },
  title: {
    fontSize: 18,
    color: '#959595',
    fontFamily: 'AvenirArabic-Heavy',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 3,
    color: '#959595',
    fontFamily: 'AvenirArabic-Light',
  },
  titleCont: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
