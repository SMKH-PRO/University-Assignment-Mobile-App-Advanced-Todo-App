import React, {useState, useEffect, useRef} from 'react';
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
  AssignmentCard,
  Toast,
} from '../Components';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import {GET_ASSIGNMENT, ADD_GOAL, CREATE_GOAL, EDIT_GOAL} from './../Constants';
import {ADD_GOALS, ADD_ASSIGNMENTS} from '../Redux/Types';
import axios from './../Utils/axios';
import {useSelector, useDispatch} from 'react-redux';
import _ from 'lodash';
import DropdownAlert from 'react-native-dropdownalert';
import {useNavigation} from '@react-navigation/native';
import {getStatusBarHeight} from 'react-native-status-bar-height';

const reminderArrHour = [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22].map(v => {
  return {
    title: v + ' hours',
    intervalType: 'hours',
    _id: v,
    interval: v,
  };
});
const reminderArrDay = [1, 2, 3, 4, 5].map(v => {
  return {
    title: v + ' days',
    intervalType: 'days',
    _id: v,
    interval: v,
  };
});

const reminderArr = [...reminderArrHour, ...reminderArrDay];
const AddGoal = ({route}) => {
  const toastRef = useRef();
  const navigation = useNavigation();
  const goalId = route?.params?.goalId;
  const isEdit = Boolean(goalId);
  const theme = useTheme();
  const dispatch = useDispatch();
  const primaryColor = theme.colors.primary;
  const assignments = useSelector(state => state.assignmentReducer.assignments);
  const goals = useSelector(state => state.goalReducer.goals);
  const goalDetails = useSelector(state =>
    state.goalReducer.goals?.find(v => v._id === goalId),
  );
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(moment().add(1, 'day')));

  const [assignment, setAssignment] = useState({});
  const [type, setType] = useState(null);
  const [isStartDateVisible, setStartDateVisibility] = useState(false);
  const [isRemindDateVisible, setRemindDateVisibility] = useState(false);
  const [isEndDateVisible, setEndDateVisibility] = useState(false);
  const [remindTime, setRemindTime] = useState({});
  const [notifyViaEmail, setNotifyViaEmail] = useState(false);
  const [notifyViaNotification, setNotifyViaNotification] = useState(false);
  const handleStartDatePick = date => {
    setStartDateVisibility(false);
    setStartDate(date);

    if (endDate) {
      if (endDate.getTime() < date.getTime()) setEndDate(date);
    }
  };
  const handleEndDatePick = date => {
    setEndDateVisibility(false);
    setEndDate(date);
  };

  const handleAssignmentSelect = data => {
    console.log(data);
    setAssignment(data);
  };
  const handleTypeSelect = data => {
    console.log(data);
    setType(data);
  };

  const getAssignments = async () => {
    try {
      const req = await axios({
        url: GET_ASSIGNMENT,

        method: 'GET',
      });
      dispatch({type: ADD_ASSIGNMENTS, payload: req.data});
      setLoading(false);
    } catch (error) {
      Toast(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assignments) {
      setLoading(false);
    }
    getAssignments();
  }, []);

  useEffect(() => {
    if (isEdit) {
      let groupedAssignments = {};
      goalDetails?.assignments?.map(v => {
        groupedAssignments = {
          ...groupedAssignments,
          [v._id]: v,
        };
      });

      let obj = {};

      goalDetails.notifyBefore.map(v => {
        obj[v.interval + ' ' + v.intervalType] = {
          interval: v.interval,
          intervalType: v.intervalType,
          title: v.interval + ' ' + v.intervalType,
          _id: v.interval,
        };
      });
      setTitle(goalDetails.title);
      setDetails(goalDetails.details);
      setStartDate(goalDetails.startDate);
      setEndDate(goalDetails.endDate);
      console.log(goalDetails.notifyBefore, 'goalDetails.notifyBefore');
      setRemindTime(obj || {});
      setNotifyViaEmail(goalDetails.notifyViaEmail);
      setNotifyViaNotification(goalDetails.notifyViaNotification);
      setAssignment(groupedAssignments);
    }
  }, [goalId]);

  const handleSubmit = async () => {
    try {
      let reqObj = {
        title: title?.trim(),
        details: details?.trim(),
        startDate,
        endDate,
        assignments: Object.keys(assignment),
        notifyBefore: Object.keys(remindTime)
          .filter(v => remindTime[v])
          .map(v => {
            return {
              interval: remindTime[v].interval,
              intervalType: remindTime[v].intervalType,
            };
          }),
        notifyViaEmail,
        notifyViaNotification,
      };
      if (!reqObj.title) {
        throw new Error('Title is Required');
      }
      if (!reqObj.details) {
        throw new Error('Details is Required');
      }
      if (!reqObj.startDate) {
        throw new Error('Start Date is Required');
      }
      if (!reqObj.endDate) {
        throw new Error('End Date is Required');
      }
      if (!reqObj.notifyBefore.length) {
        throw new Error('Reminder time is Required');
      }
      if (!reqObj.notifyViaEmail && !reqObj.notifyViaNotification) {
        throw new Error('One type of notify is Required');
      }

      reqObj.dateString = moment(reqObj.endDate).format('DD MMM YYYY');
      setLoading(true);
      const req = await axios({
        url: CREATE_GOAL,
        data: reqObj,
        method: 'POST',
      });

      // return
      dispatch({type: ADD_GOALS, payload: [...(goals || []), req.data]});
      setTitle('');
      setDetails('');
      setStartDate(null);
      setAssignment({});
      setEndDate(new Date(moment().add(1, 'day')));
      setRemindTime({});
      setNotifyViaEmail(null);
      setNotifyViaNotification(null);
      toastRef.current.alertWithType(
        'success',
        'Success',
        'Goal added successfully',
      );
      setLoading(false);
      navigation.goBack();
    } catch (error) {
      toastRef.current.alertWithType('error', 'Error', error.message);
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    try {
      console.log(remindTime);
      let reqObj = {
        title: title?.trim(),
        details: details?.trim(),
        startDate,
        endDate,
        assignments: Object.keys(assignment),
        notifyBefore: Object.keys(remindTime)
          .filter(v => remindTime[v])
          .map(v => {
            return {
              interval: remindTime[v].interval,
              intervalType: remindTime[v].intervalType,
            };
          }),
        notifyViaEmail,
        notifyViaNotification,
        goalId,
      };
      if (!reqObj.title) {
        throw new Error('Title is Required');
      }
      if (!reqObj.details) {
        throw new Error('Details is Required');
      }
      if (!reqObj.startDate) {
        throw new Error('Start Date is Required');
      }
      if (!reqObj.endDate) {
        throw new Error('End Date is Required');
      }
      if (!reqObj.notifyBefore.length) {
        throw new Error('Reminder time is Required');
      }
      if (!reqObj.notifyViaEmail && !reqObj.notifyViaNotification) {
        throw new Error('One type of notify is Required');
      }
      if (new Date(endDate).getTime() > new Date().getTime()) {
        reqObj['status'] = 'active';
      }

      if (new Date(endDate).getTime() < new Date().getTime()) {
        reqObj['status'] = 'due';
      }
      reqObj.dateString = moment(reqObj.endDate).format('DD MMM YYYY');
      setLoading(true);
      const req = await axios({
        url: EDIT_GOAL,
        data: reqObj,
        method: 'POST',
      });
      let goalsEdited = [...(goals || [])];

      let goalIndex = goalsEdited.findIndex(v => v._id == goalId);
      let goalFind = goalsEdited.find(v => v._id == goalId);
      goalsEdited[goalIndex] = req.data;
      dispatch({type: ADD_GOALS, payload: goalsEdited});

      toastRef.current.alertWithType(
        'success',
        'Success',
        'Goal edited successfully',
      );
      setLoading(false);
      navigation.goBack();
    } catch (error) {
      toastRef.current.alertWithType('error', 'Error', error.message);
      setLoading(false);
    }
  };

  const startDateStr = startDate ? moment(startDate).format('DD MMM YYYY') : '';
  const endDateStr = endDate ? moment(endDate).format('DD MMM YYYY') : '';
  // const remindTimeStr = remindTime
  //   ? moment(remindTime).format('DD MMM YYYY')
  //   : '';
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
              {isEdit ? 'Edit Goal' : 'Add Goals'}
            </Text>
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
                style={[
                  Platform.OS === 'ios' && {
                    height: 120,
                    justifyContent: 'flex-start',
                  },
                ]}
              />
            </View>
            <View style={styles.dateContainer}>
              <View style={[styles.date, {paddingRight: 8}]}>
                <TouchableInput
                  value={startDateStr}
                  label="Start Date"
                  onPress={() => setStartDateVisibility(true)}
                />
              </View>
              <View style={[styles.date, {paddingLeft: 8}]}>
                <TouchableInput
                  value={endDateStr}
                  label="End Date"
                  onPress={() => setEndDateVisibility(true)}
                />
              </View>
            </View>
            <View style={styles.inputContainer}>
              <ListInput
                value={assignment}
                setValue={setAssignment}
                label={
                  Boolean(Object.keys(assignment)?.length)
                    ? 'Add more Tasks'
                    : 'Select Task'
                }
                onSelect={handleAssignmentSelect}
                data={assignments}
                identifier="_id"
                isMultiple
                CustomCard={AssignmentCard}
              />
            </View>
            <View style={styles.inputContainer}>
              {/* <TouchableInput
              value={remindTimeStr}
              onPress={() => setRemindDateVisibility(true)}
               */}
              <ListInput
                value={remindTime}
                setValue={setRemindTime}
                label="Select when to remind"
                onSelect={setRemindTime}
                data={reminderArr}
                identifier="title"
                isMultiple
                // CustomCard={AssignmentCard}
              />
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
                  <Text style={styles.checkText}>
                    Notify via Push Notification
                  </Text>
                </View>
              </View>
            </View>
            <DateTimePickerModal
              isVisible={isStartDateVisible}
              mode="date"
              onConfirm={handleStartDatePick}
              onCancel={() => setStartDateVisibility(false)}
              date={new Date(startDate) || new Date()}
              minimumDate={new Date()}
            />
            <DateTimePickerModal
              isVisible={isEndDateVisible}
              mode="date"
              onConfirm={handleEndDatePick}
              onCancel={() => setEndDateVisibility(false)}
              date={new Date(endDate) || new Date()}
              minimumDate={new Date(moment(startDate).add(1, 'day'))}
            />
            {/* <DateTimePickerModal
            isVisible={isRemindDateVisible}
            mode="datetime"
            onConfirm={handleRemindDatePick}
            onCancel={() => setRemindDateVisibility(false)}
            date={new Date(remindTime) || new Date()}
            minimumDate={new Date()}
          /> */}
          </View>
          <View style={styles.btnContainer}>
            {isEdit ? (
              <CustomButton
                onPress={handleEdit}
                loading={loading}
                disabled={loading}>
                Edit Goal
              </CustomButton>
            ) : (
              <CustomButton
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}>
                Add Goal
              </CustomButton>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <DropdownAlert ref={toastRef} />
    </View>
  );
};

export default AddGoal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 10,
    fontSize: 24,
    fontFamily: 'AvenirArabic-Heavy',
    textAlign: 'center',
  },
  inputContainer: {
    marginVertical: 5,
  },
  dateContainer: {
    marginVertical: 5,
    flexDirection: 'row',
  },
  date: {
    flex: 1,
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

  checkText: {
    color: '#707070',
    paddingHorizontal: 10,
  },
  btnContainer: {
    paddingHorizontal: 5,
    marginTop: 10,
  },
});
