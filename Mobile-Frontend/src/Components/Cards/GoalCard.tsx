import React from 'react';
import {Text, useTheme} from 'react-native-paper';
import Entypo from 'react-native-vector-icons/Entypo';
import {View, TouchableOpacity, StyleSheet, Image} from 'react-native';
import moment from 'moment';
import {useNavigation} from '@react-navigation/native';
import {GOAL_DETAILS_PATH} from '../../Navigation/Routes';
import DUMMY_IMAGE from './../../Assets/Images/dummy-image.jpg';
import NO_IMAGE from './../../Assets/Images/empty-subject.png';
import ImagePlaceholder from 'react-native-img-placeholder';
const SubjectCard = ({data}) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const primaryColor = theme.colors.primary;
  const {
    title,
    image,
    details,
    dueDate,
    startDate,
    endDate,
    assignments,
    _id,
    status,
  } = data;
  const totalAssignments = assignments?.filter(
    v => v.status !== 'deleted',
  )?.length;
  const pendingAssignments = assignments?.filter(
    v => v.status === 'completed',
  ).length;
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate(GOAL_DETAILS_PATH, {goalId: _id})}>
      <View style={styles.imageContainer}>
        <ImagePlaceholder
          source={image ? {uri: image} : DUMMY_IMAGE}
          style={styles.image}
          placeholderStyle={styles.image} // placeholderSource={NO_IMAGE}
          borderRadius={10}
        />
      </View>
      <View style={styles.content}>
        <View style={styles.subjectContainer}>
          <Text style={styles.subject} numberOfLines={1}>
            {title}
          </Text>
          <View style={[styles.count, {backgroundColor: primaryColor}]}>
            <Text style={styles.countText}>
              {pendingAssignments}/{totalAssignments}
            </Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {details}
        </Text>
        <View style={styles.dateContainer}>
          <View style={styles.date}>
            <Text style={[styles.dateText, {color: primaryColor}]}>
              {moment(new Date(startDate)).format('DD MMM YYYY')}
              {' - '}
              {moment(new Date(endDate)).format('DD MMM YYYY')}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SubjectCard;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 25,
    paddingVertical: 20,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 3,
  },
  image: {
    width: 90,
    height: 70,
    borderRadius: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  subjectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 10,
    // marginTop: -5,
  },
  title: {
    paddingLeft: 10,
    color: '#959595',
    paddingVertical: 2,
  },
  subject: {
    flex: 1,
    fontSize: 16,
    // fontWeight: 'bold',
    color: '#1A1A1A',
    fontFamily: 'AvenirArabic-Heavy',
  },
  count: {
    paddingHorizontal: 20,
    paddingVertical: 3,
    borderRadius: 5,
  },
  countText: {
    color: '#fff',
    fontSize: 12,
  },
  upComing: {
    fontSize: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  date: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 15,
    paddingVertical: 3,
    borderRadius: 5,
  },
  dateText: {
    fontSize: 11,
  },
});
