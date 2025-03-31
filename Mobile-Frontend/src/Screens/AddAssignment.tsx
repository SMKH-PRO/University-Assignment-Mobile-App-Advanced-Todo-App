import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';

import {Text, useTheme, Checkbox} from 'react-native-paper';
import {
  Header,
  LoginInput,
  TouchableInput,
  ListInput,
  CustomButton,
  Toast,
} from '../Components';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import {
  ADD_ASSIGNMENT_TYPES,
  ADD_PENDING_ASSIGNMENTS,
  ADD_SUBJECT,
  ADD_ASSIGNMENTS,
  ADD_ASSIGNMENT_DETAILS,
  SET_SUBJECT,
} from '../Redux/Types';
import {CREATE_ASSIGNMENT, EDIT_ASSIGNMENT} from './../Constants';
import {useDispatch, useSelector} from 'react-redux';
import axios from './../Utils/axios';
import {AssignmentDetails} from '.';
import DropdownAlert, { DropdownAlertData, DropdownAlertType } from 'react-native-dropdownalert';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {SELECT_SUBJECT_PATH} from '../Navigation/Routes';
import {getStatusBarHeight} from 'react-native-status-bar-height';

const AddAssignment = ({route}) => {
  const dispatch = useDispatch();
  let alert = (data?: DropdownAlertData) => new Promise<DropdownAlertData>(res => res(data || {}));
  const navigation = useNavigation();
  const theme = useTheme();
  const primaryColor = theme.colors.primary;
  const subjects = useSelector(state => state.subjectReducer.subjects);
  const selectedSubject = useSelector(
    state => state?.metaReducer?.selectedSubject,
  );
  const assignmentId = route?.params?.assignmentId;
  const isEdit = Boolean(assignmentId);
  const assignmentTypes = useSelector(
    state => state.assignmentReducer.assignmentTypes,
  );
  const assignments = useSelector(
    state => state.assignmentReducer.assignments || [],
  );

  const assignmentDetails = useSelector(
    state => state.assignmentReducer.assignmentDetails?.[assignmentId],
  );
  const assignmentDetailsDetails = useSelector(
    state => state.assignmentReducer.assignmentDetails,
  );
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [dueDate, setDueDate] = useState(new Date(moment().add(1, 'day')));
  const [subject, setSubject] = useState(null);
  const [type, setType] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [notifyViaEmail, setNotifyViaEmail] = useState(false);
  const [notifyViaNotification, setNotifyViaNotification] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleDatePick = date => {
    setDatePickerVisibility(false);
    setDueDate(date);
  };
  const handleSubjectSelect = data => {
    console.log(data);
    setSubject(data);
  };
  const handleTypeSelect = data => {
    console.log(data);
    setType(data);
  };

  const handleSubmit = async () => {
    try {
      let reqObj = {
        title: title?.trim(),
        details: details?.trim(),
        dueDate,
        subject: subject?._id,
        type: type?._id,
        notifyViaEmail,
        notifyViaNotification,
      };

      if (!reqObj.title) {
        throw new Error('Title is Required');
      }
      if (!reqObj.details) {
        throw new Error('Details is Required');
      }
      if (!reqObj.dueDate) {
        throw new Error('Due Date is Required');
      }
      if (!reqObj.subject) {
        throw new Error('Subject is Required');
      }
      // if (!reqObj.type) {
      //   throw new Error('Type is Required');
      // }
      reqObj.dateString = moment(reqObj.dueDate).format('DD MMM YYYY hh:mm a');
      setLoading(true);
      const req = await axios({
        url: CREATE_ASSIGNMENT,
        data: reqObj,
        method: 'POST',
      });
      dispatch({type: ADD_ASSIGNMENTS, payload: [...assignments, req.data]});
      setLoading(false);
      setTitle('');
      setDetails('');
      setSubject(null);
      setType(null);
      dispatch({type: SET_SUBJECT, payload: null});
      setDueDate(new Date(moment().add(1, 'day')));
      await alert({
        type: DropdownAlertType.Success,
        title: 'Success',
        message: 'Tasks added successfully',
      });
    } catch (error: any) {
      setLoading(false);
      await alert({
        type: DropdownAlertType.Error,
        title: 'Error',
        message: error?.message || 'An error occurred',
      });
    }
  };

  const handleEdit = async () => {
    try {
      let reqObj = {
        title: title?.trim(),
        details: details?.trim(),
        dueDate,
        subject: subject?._id,
        type: type?._id,
        assignmentId,
        notifyViaEmail,
        notifyViaNotification,
      };

      if (!reqObj.title) {
        throw new Error('Title is Required');
      }
      if (!reqObj.details) {
        throw new Error('Details is Required');
      }
      if (!reqObj.dueDate) {
        throw new Error('Due Date is Required');
      }
      if (!reqObj.subject) {
        throw new Error('Subject is Required');
      }
      // if (!reqObj.type) {
      //   throw new Error('Type is Required');
      // }

      reqObj.dateString = moment(reqObj.dueDate).format('DD MMM YYYY hh:mm a');
      if (new Date(dueDate).getTime() > new Date().getTime()) {
        reqObj['status'] = 'active';
      }

      if (new Date(dueDate).getTime() < new Date().getTime()) {
        reqObj['status'] = 'due';
      }

      setLoading(true);
      const req = await axios({
        url: EDIT_ASSIGNMENT,
        data: reqObj,
        method: 'POST',
      });
      dispatch({
        type: ADD_ASSIGNMENT_DETAILS,
        payload: {
          ...assignmentDetailsDetails,
          [assignmentId]: req.data,
        },
      });
      setLoading(false);
      await alert({
        type: DropdownAlertType.Success,
        title: 'Success',
        message: 'Task edited successfully',
      });
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error: any) {
      setLoading(false);
      await alert({
        type: DropdownAlertType.Error,
        title: 'Error',
        message: error?.message || 'An error occurred',
      });
    }
  };

  useEffect(() => {
    if (isEdit) {
      setTitle(assignmentDetails?.title);
      setDetails(assignmentDetails?.details);
      setDueDate(assignmentDetails?.dueDate);
      setSubject(assignmentDetails?.subject?.[0]);
      setType(assignmentDetails?.type?.[0]);

      dispatch({type: SET_SUBJECT, payload: assignmentDetails?.subject?.[0]});
    } else {
      // dispatch({
      //   type: SET_SUBJECT,
      //   payload: null,
      // });
    }
    return () => {
      // dispatch({
      //   type: SET_SUBJECT,
      //   payload: null,
      // });
    };
  }, [assignmentId]);
  useFocusEffect(
    useCallback(() => {
      return () => {
        dispatch({
          type: SET_SUBJECT,
          payload: null,
        });
      };
    }, [assignmentId]),
  );

  useEffect(() => {
    setSubject(selectedSubject);
  }, [selectedSubject]);

  const dueDateStr = dueDate
    ? moment(dueDate).format('DD MMM YYYY hh:mm a')
    : '';

  // console.log(assignmentDetails, 'assignmentDetails');
  return (
    <View style={styles.container}>
      <Header elevation={0} iconRight="close" />
      <KeyboardAvoidingView
        style={{flex: 1}}
        keyboardVerticalOffset={getStatusBarHeight()}
        behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <ScrollView contentContainerStyle={{flexGrow: 1, padding: 15}}>
          <View style={styles.container}>
            <Text style={styles.header}>
              {isEdit ? 'Edit Task' : 'Add Task'}
            </Text>
            <View style={styles.inputContainer}>
              <TouchableInput
                value={subject?.title}
                label="Category"
                onPress={() => navigation.navigate(SELECT_SUBJECT_PATH)}
              />
              {/* <ListInput
              value={subject}
              onChange={setSubject}
              label="Subject"
              onSelect={handleSubjectSelect}
              onClose={() => setDatePickerVisibility(false)}
              data={subjects}
              inputifier="_id"
            /> */}
            </View>
            <View style={styles.inputContainer}>
              <LoginInput value={title} onChange={setTitle} label="Title" />
            </View>
            <View style={styles.inputContainer}>
              <LoginInput
                value={details}
                onChange={setDetails}
                label="Details"
                multiline
                numberOfLines={5}
                style={
                  Platform.OS === 'ios' && {
                    height: 120,
                    justifyContent: 'flex-start',
                  }
                }
              />
            </View>
            <View style={styles.inputContainer}>
              <TouchableInput
                value={dueDateStr}
                label="Due Date"
                onPress={() => setDatePickerVisibility(true)}
              />
            </View>

            {/* <View style={styles.inputContainer}>
              <ListInput
                value={type}
                onChange={setType}
                label="Type"
                onSelect={handleTypeSelect}
                onClose={() => setDatePickerVisibility(false)}
                data={assignmentTypes}
                inputifier="_id"
              />
            </View> */}
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="datetime"
              onConfirm={handleDatePick}
              onCancel={() => setDatePickerVisibility(false)}
              date={new Date(dueDate) || new Date(moment().add(1, 'day'))}
              minimumDate={new Date(moment().add(1, 'day'))}
            />
          </View>

          <View style={styles.selectedContainer}>
            <View style={styles.check}>
              <Checkbox.Android
                status={notifyViaEmail ? 'checked' : 'unchecked'}
                onPress={() => {
                  setNotifyViaEmail(!notifyViaEmail);
                }}
                color={primaryColor}
              />
              <Text style={styles.checkText}>Notify via Email</Text>
            </View>
            <View style={styles.check}>
              <Checkbox.Android
                status={notifyViaNotification ? 'checked' : 'unchecked'}
                onPress={() => {
                  setNotifyViaNotification(!notifyViaNotification);
                }}
                color={primaryColor}
              />
              <Text style={styles.checkText}>Notify via Push Notification</Text>
            </View>
          </View>
          <View style={styles.btnContainer}>
            {isEdit ? (
              <CustomButton
                onPress={handleEdit}
                loading={loading}
                disabled={loading}>
                Edit Task
              </CustomButton>
            ) : (
              <CustomButton
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}>
                Add Task
              </CustomButton>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <DropdownAlert alert={func => (alert = func)} />
    </View>
  );
};

export default AddAssignment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 10,
    fontSize: 24,
    fontFamily: 'AvenirArabic-Heavy',
    // fontWeight: 'bold',
    textAlign: 'center',
  },
  inputContainer: {
    marginVertical: 5,
  },
  btnContainer: {
    paddingHorizontal: 5,
    marginTop: 10,
  },
  selectedContainer: {
    margin: 5,
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    borderWidth: 0.6,
    borderColor: 'lightgray',
  },
  check: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
