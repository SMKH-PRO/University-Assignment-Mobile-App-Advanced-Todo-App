import React from 'react';
import {Text, useTheme, Checkbox} from 'react-native-paper';
import Entypo from 'react-native-vector-icons/Entypo';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Text as NativeText,
} from 'react-native';
import moment from 'moment';
import PENDING from './../../Assets/Images/pending.png';
import DONECHECK from './../../Assets/Images/done-check.png';
import WARNING from './../../Assets/Images/warning.png';
import DUMMY_IMAGE from './../../Assets/Images/dummy-image.jpg';
import NO_IMAGE from './../../Assets/Images/empty-subject.png';
import {useNavigation} from '@react-navigation/native';
import {AS, ASSIGNMENT_DETAILS_PATH} from '../../Navigation/Routes';
import ImagePlaceholder from 'react-native-img-placeholder';
const Capitalize = (str) =>  {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
const MiniAssignmentCard = ({data, disabled = false, selected, image}) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const primaryColor = theme.colors.primary;
  const {title,  subject, dueDate, type, createdAt, status, _id} = data;

  const dateIsBefore = moment(createdAt).isBefore(moment(dueDate));
  // console.log(subject, 'selected');

  const imageUrl = image || data.image;
  const IMAGE_ICON =
    status === 'completed' ? DONECHECK : status === 'active' ? PENDING : WARNING;
  return (
    <TouchableOpacity
      disabled={disabled}
      style={styles.container}
      onPress={() =>
        navigation.navigate(ASSIGNMENT_DETAILS_PATH, {assignmentId: _id})
      }>
      <View style={styles.imageContainer}>
        <ImagePlaceholder
          source={imageUrl ? {uri: imageUrl} : DUMMY_IMAGE}
          style={styles.image}
          placeholderStyle={styles.image} // placeholderSource={NO_IMAGE}
          borderRadius={15}
        />

      </View>
      <View>
          <Text style={styles.title}  numberOfLines={1}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default MiniAssignmentCard;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 5,
    paddingVertical: 5,
    alignItems: 'center',
    width: 100,
    paddingTop: 10,
    // flexDirection: 'row',
    // backgroundColor: 'pink',
    borderColor: '#f0f0f0',
    borderWidth: 1,
    borderRadius: 5,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 100,
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
    // paddingLeft: 10,
    fontWeight: 'bold',
    color: '#222',
    marginVertical: 3,
    fontFamily: 'AvenirArabic-Heavy',
  },
  subject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#959595',
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
    color: '#959595',
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
  pendingCheck: {
    width: 22,
    height: 20,
    resizeMode: 'contain',
  },
});
