import React, {useRef, useState, useEffect, useCallback} from 'react';
import {View, StyleSheet, FlatList, BackHandler} from 'react-native';

import {Text, useTheme} from 'react-native-paper';
import {
  Header,
  FilterComponent,
  GoalSubjectCard,
  GoalSideBar,
  Toast,
} from './../Components';
import moment from 'moment';
import {List} from 'react-native-paper';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {ADD_GOAL_PATH } from '../Navigation/Routes';
import _ from 'lodash';
import Drawer from 'react-native-drawer';
import {GET_GOAL_BY_ID } from '../Constants';
import DropdownAlert, { DropdownAlertData, DropdownAlertType } from 'react-native-dropdownalert';
import axios from './../Utils/axios';
import qs from 'qs';

import {ADD_GOALS, SET_SUBJECT} from '../Redux/Types';
const GoalDetails = ({route}) => {
  let alert = (data?: DropdownAlertData) => new Promise<DropdownAlertData>(res => res(data || {}));
  const drawerRef = useRef();
  const theme = useTheme();
  const dispatch = useDispatch();
  const primaryColor = theme.colors.primary;
  const iconColor = theme.colors.icon;
  const goalId = route?.params?.goalId;
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [grouped, setGrouped] = useState({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const goalDetails = useSelector(state =>
    state.goalReducer.goals.find(v => v._id === goalId),
  );
  const goals = useSelector(state => state.goalReducer.goals);

  const [randomNumber, setRandomNumber] = useState(0);
  const [filterStatus, setFilterStatus] = useState(null);

  const closeControlPanel = () => {
    drawerRef.current.close();
    setFilterOpen(true);
  };
  const openControlPanel = () => {
    drawerRef.current.open();
    setFilterOpen(false);
    setRandomNumber(new Date().getTime());
  };
  const getGoalDetails = async (refresh) => {
    try {
      if (refresh) {
        setRefreshing(true);
      }
      const req = await axios({url: GET_GOAL_BY_ID + qs.stringify({goalId})});

      const goalsEdited = [...(goals || [])];

      const goalIndex = goalsEdited.findIndex(v => v._id == goalId);
      goalsEdited[goalIndex] = req.data;
      dispatch({type: ADD_GOALS, payload: goalsEdited});
      handleGrouping(
        filterStatus
          ? goalsEdited[goalIndex].assignments.filter(
              v => v.status === filterStatus,
            )
          : goalsEdited[goalIndex].assignments,
      );
      setLoading(false);
      // closeControlPanel();
      setRefreshing(false);
    } catch (error: any) {
      await alert({
        type: DropdownAlertType.Error,
        title: 'Error',
        message: error?.message || 'An error occurred',
      });
      setRefreshing(false);

      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      dispatch({
        type: SET_SUBJECT,
        payload: null,
      });
      const backAction = () => {
        if (filterOpen) {
          console.log(1, 'filterOpen');
          navigation.goBack();
        } else {
          console.log(2, 'filterOpen');
          closeControlPanel();
        }
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );
      getGoalDetails();
      return () => backHandler.remove();
    }, [filterOpen]),
  );

  const handleGrouping = assignments => {
    setGrouped(_.groupBy(assignments, 'subject.title'));
  };

  const handleFilter = (filterAtr = {}) => {
    const reqObj = Object.entries(filterAtr).reduce(
      (a, [k, v]) => (v === null ? a : ((a[k] = v), a)),
      {},
    );
    setFilterStatus(reqObj.status);
    handleGrouping(
      reqObj.status
        ? goalDetails.assignments.filter(v => v.status === reqObj.status)
        : goalDetails.assignments,
    );
    console.log('OPOPOP');
    closeControlPanel();
  };

  useEffect(() => {
    handleGrouping(goalDetails.assignments);
  }, []);
  return (
    <View style={styles.container}>
      <Drawer
        ref={drawerRef}
        type="overlay"
        side="right"
        content={
          <GoalSideBar
            onClose={closeControlPanel}
            handleSubmit={handleFilter}
            loading={loading}
            didClose={randomNumber}
            filterValues={filterStatus}
          />
        }
        tapToClose={true}
        openDrawerOffset={0.3} // 20% gap on the right side of drawer
        panCloseMask={0.2}
        closedDrawerOffset={-0.3}
        styles={drawerStyles}
        tweenHandler={ratio => ({
          main: {opacity: (2 - ratio) / 2},
        })}>
        <Header
          title={'Goal Details'}
          iconRight={() => (
            <FontAwesome name="pencil-square-o" size={20} color={iconColor} />
          )}
          iconLeft="close"
          hasLeftBtn
          onLeftBtn={() => navigation.goBack()}
          onBackBtn={() => navigation.navigate(ADD_GOAL_PATH, {goalId})}
        />
        <List.Section style={styles.content}>
          <FlatList
            data={Object.keys(grouped) || []}
            renderItem={({item}) => (
              <GoalSubjectCard data={grouped[item]} title={item} />
            )}
            keyExtractor={item => item}
            refreshing={refreshing}
            onRefresh={() => getGoalDetails(true)}
            ListHeaderComponent={() => {
              return (
                <>
                  <FilterComponent
                    title={goalDetails?.title}
                    onPress={openControlPanel}
                  />
                  <View style={styles.header}>
                    <Text style={styles.details}>{goalDetails?.details}</Text>
                    <View style={styles.dateContainer}>
                      <View style={styles.date}>
                        <Text style={[styles.dateText, {color: primaryColor}]}>
                          {moment(new Date(goalDetails?.startDate)).format(
                            'DD MMM YYYY',
                          )}
                          {' - '}
                          {moment(new Date(goalDetails?.endDate)).format(
                            'DD MMM YYYY',
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>
                </>
              );
            }}
          />
        </List.Section>
      </Drawer>
      <DropdownAlert alert={func => (alert = func)} />
    </View>
  );
};

export default GoalDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
  },
  details: {
    color: '#959595',
    letterSpacing: 0.5,
    fontSize: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingLeft: 10,
    // marginTop: -5,
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
  content: {
    flex: 1,
  },
});

const drawerStyles = {
  drawer: {shadowColor: '#000000', shadowOpacity: 0.8, shadowRadius: 3},
  // main: {paddingLeft: 3},
};
