import * as React from 'react';
import {Checkbox, Text, useTheme} from 'react-native-paper';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import moment from 'moment';
import {useNavigation} from '@react-navigation/native';
import {ASSIGNMENT_DETAILS_PATH} from '../../Navigation/Routes';
const SubjectAssignment = ({data}) => {
  const [checked, setChecked] = React.useState(true);
  const theme = useTheme();
  const navigation = useNavigation();
  const primaryColor = theme.colors.primary;
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        navigation.navigate(ASSIGNMENT_DETAILS_PATH, {assignmentId: data?._id})
      }>
      <View style={styles.checkbox}>
        <Checkbox.Android
          status={checked ? 'checked' : 'unchecked'}
          // onPress={() => {
          //   setChecked(!checked);
          // }}
          color={data.status === 'completed' ? primaryColor : '#DCDCDD'}
        />
      </View>
      <View>
        <View>
          <Text style={styles.title}  numberOfLines={1}>{data.title}</Text>
        </View>
        <View style={styles.dateContainer}>
          <View style={styles.date}>
            <Text style={[styles.dateText, {color: primaryColor}]}>
              {moment(data.dueDate).format('DD MMM YYYY')}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SubjectAssignment;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 22,
    flexDirection: 'row',
    // alignItems: 'center',
    borderBottomColor: '#DCDCDD',
    borderBottomWidth: 1,
    paddingVertical: 5,
    paddingTop: 10,
  },
  checkbox: {
    paddingHorizontal: 10,
  },
  title: {
    // fontWeight: 'bold',
    fontFamily: 'AvenirArabic-Heavy',
  },
  date: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 15,
    paddingVertical: 3,
    borderRadius: 10,
  },
  dateText: {
    fontSize: 11,
  },
  dateContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingVertical: 5,
  },
});
