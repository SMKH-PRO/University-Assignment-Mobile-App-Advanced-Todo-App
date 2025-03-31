import React, {useState, useEffect, useRef, useCallback} from 'react';

import {
  View,
  StyleSheet,
  ScrollView,
  Touchable,
  TouchableOpacity,
} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {CustomButton, Header, Toast, Loading} from '../Components';
import {
  GET_ASSIGNMENT_BY_ID,
  COMPLETED_ASSIGNMENT,
  READ_NOTIFICATION,
} from './../Constants';
import {ADD_ASSIGNMENT_DETAILS} from './../Redux/Types';
import {useDispatch, useSelector} from 'react-redux';
import axios from './../Utils/axios';
import moment from 'moment';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import qs from 'qs';
import {useNavigation, useFocusEffect} from '@react-navigation/native';

import {
  ADD_ASSIGNMENT_PATH,
  SUBJECT_DETAILS_PATH,
  GOAL_DETAILS_PATH,
} from './../Navigation/Routes';
import DropdownAlert, { DropdownAlertData, DropdownAlertType } from 'react-native-dropdownalert';
const AssignmentDetails = ({route}) => {
  let alert = (data?: DropdownAlertData) => new Promise<DropdownAlertData>(res => res(data || {}));
  const theme = useTheme();
  const primaryColor = theme.colors.primary;
  const iconColor = theme.colors.icon;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {assignmentId, notificationId} = route.params;
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const assignmentDetails = useSelector(
    state => state.assignmentReducer.assignmentDetails?.[assignmentId],
  );
  const assignmentDetailsAll = useSelector(
    state => state.assignmentReducer.assignmentDetails,
  );

  useFocusEffect(
    useCallback(() => {
      if (notificationId) {
        handleNotification();
      }
      if (assignmentDetails) {
        setLoading(false);
      }
      getAssignment();
    }, []),
  );

  const getAssignment = async () => {
    try {
      const reqObj = {
        assignmentId,
      };

      console.log(reqObj, 'reqObj');
      const req = await axios({
        url: GET_ASSIGNMENT_BY_ID + qs.stringify(reqObj),

        method: 'GET',
      });

      // console.log(req.data?.[0], 'req.data?.[0]');
      dispatch({
        type: ADD_ASSIGNMENT_DETAILS,
        payload: req.data?.[0],
        assignmentId,
      });
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      await alert({
        type: DropdownAlertType.Error,
        title: 'Error',
        message: error?.message || 'An error occurred',
      });
    }
  };

  const handleCompletion = async () => {
    try {
      let reqObj = {
        assignmentId,
      };

      setBtnLoading(true);
      const req = await axios({
        url: COMPLETED_ASSIGNMENT,
        data: reqObj,
        method: 'POST',
      });
      getAssignment();
      setBtnLoading(false);
      await alert({
        type: DropdownAlertType.Success,
        title: 'Success',
        message: 'Task Completed successfully',
      });
    } catch (error: any) {
      setBtnLoading(false);
      await alert({
        type: DropdownAlertType.Error,
        title: 'Error',
        message: error?.message || 'An error occurred',
      });
    }
  };

  const handleNotification = async () => {
    try {
      let reqObj = {
        notificationId,
      };

      // setBtnLoading(true);
      const req = await axios({
        url: READ_NOTIFICATION,
        data: reqObj,
        method: 'POST',
      });

      console.log(req, 'NOTIFICATION');
      // getAssignment()
      // setBtnLoading(false);
      // Toast('Assignment Completed Successfully');
    } catch (error: any) {
      setBtnLoading(false);
      Toast(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={'Task Details'}
        iconRight={
          assignmentDetails?.status !== 'completed'
            ? () => (
                <FontAwesome
                  name="pencil-square-o"
                  size={20}
                  color={iconColor}
                />
              )
            : undefined
        }
        iconLeft="close"
        hasLeftBtn={assignmentDetails?.status !== 'completed'}
        onLeftBtn={() => navigation.goBack()}
        onBackBtn={
          assignmentDetails?.status !== 'completed'
            ? () => navigation.navigate(ADD_ASSIGNMENT_PATH, {assignmentId})
            : undefined
        }
      />
      {loading ? (
        <Loading />
      ) : (
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.title}>{assignmentDetails?.title}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.details}>{assignmentDetails?.details}</Text>
            </View>
            <View style={styles.section}>
              <View style={styles.item}>
                <Text style={styles.itemText}>Due Date</Text>
                <Text style={styles.itemText}>
                  {moment(assignmentDetails?.dueDate).format('DD MMM YYYY hh:mm a')}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.itemText}>Subject</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate(SUBJECT_DETAILS_PATH, {
                      subjectId: assignmentDetails?.subject?.[0]?._id,
                    })
                  }>
                  <Text style={styles.itemText}>
                    {assignmentDetails?.subject?.[0]?.title}
                  </Text>
                </TouchableOpacity>
              </View>
              {/* <View style={styles.item}>
                <Text style={styles.itemText}>Type</Text>
                <Text style={styles.itemText}>
                  {assignmentDetails?.type?.[0]?.title}
                </Text>
              </View> */}
              {Boolean(assignmentDetails?.Goal.length) && (
                <View style={styles.item}>
                  <Text style={styles.itemText}>Goals</Text>
                  <View style={{flexDirection: 'row'}}>
                    {assignmentDetails?.Goal?.map((v, i) => (
                      <>
                        <TouchableOpacity
                          style={{marginLeft: 3}}
                          onPress={() =>
                            navigation.navigate(GOAL_DETAILS_PATH, {
                              goalId: v?._id,
                            })
                          }>
                          <Text style={styles.itemText}>{v.title}</Text>
                        </TouchableOpacity>
                        {i !== assignmentDetails?.Goal?.length - 1 && (
                          <Text>,</Text>
                        )}
                      </>
                    ))}
                  </View>
                </View>
              )}
              <View style={styles.item}>
                <Text style={styles.itemText}>Status</Text>
                <Text style={styles.itemText}>{assignmentDetails?.status}</Text>
              </View>
            </View>
          </View>
          {assignmentDetails?.status !== 'completed' && (
            <View style={styles.btnContainer}>
              <CustomButton
                onPress={handleCompletion}
                loading={btnLoading}
                disabled={btnLoading}>
                Mark as Completed
              </CustomButton>
            </View>
          )}
        </ScrollView>
      )}
      <DropdownAlert alert={func => (alert = func)} />
    </View>
  );
};

export default AssignmentDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginVertical: 5,
  },
  title: {
    letterSpacing: 0.5,
    fontFamily: 'AvenirArabic-Heavy',
    fontSize: 18,
  },
  details: {
    color: '#959595',
    letterSpacing: 0.5,
    fontSize: 16,
    marginTop: 5,
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopColor: '#f0f0f0',
    borderTopWidth: 1,
    paddingVertical: 7,
  },
  itemText: {
    fontSize: 13,
    fontFamily: 'AvenirArabic-Heavy',
  },
  btnContainer: {
    padding: 5,
    paddingHorizontal: 20,
  },
});
