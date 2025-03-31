import React from 'react';
import {Text, useTheme} from 'react-native-paper';
import Entypo from 'react-native-vector-icons/Entypo';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Text as TextNative,
} from 'react-native';
import moment from 'moment';
import {useNavigation} from '@react-navigation/native';
import {SUBJECT_DETAILS_PATH} from '../../Navigation/Routes';
import ImagePlaceholder from 'react-native-img-placeholder';
import NO_IMAGE from './../../Assets/Images/empty-subject.png';

import DUMMY_IMAGE from './../../Assets/Images/dummy-image.jpg';
const SubjectCard = ({data}) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const primaryColor = theme.colors.primary;
  const {title, image, subject, Assignment, AssignmentCount, _id} = data;
  const assignment = Assignment;
  // console.log(image, 'OPOPOPOP');
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        navigation.navigate(SUBJECT_DETAILS_PATH, {subjectId: _id})
      }>
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
          <TextNative style={styles.subject} numberOfLines={1}>
            {title}
          </TextNative>
          <View style={[styles.count, {backgroundColor: primaryColor}]}>
            <Text style={styles.countText}>{AssignmentCount}</Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {assignment?.title}
        </Text>
        <View style={styles.dateContainer}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Entypo name="dot-single" />
            <Text style={styles.upComing}>Upcoming Deadline</Text>
          </View>
          <View style={styles.date}>
            <Text style={[styles.dateText, {color: primaryColor}]}>
              {moment(new Date(assignment?.dueDate)).format('DD MMM YYYY')}
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
    width: 100,
    height: 80,
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
    marginBottom: -2,
  },
  subject: {
    fontSize: 16,
    // fontWeight: 'bold',
    color: '#1A1A1A',
    flex: 1,
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
