import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Dimensions,
  Keyboard,
  BackHandler,
  SafeAreaView,
  Platform,
} from 'react-native';
import {Text} from 'react-native-paper';
import {
  Header,
  SearchBar,
  FilterComponent,
  SubjectCard,
  Footer,
  Toast,
  Loading,
  EmptyComponent,
  HomeSideBar,
  AssignmentCard,
  CustomButton,
  MiniAssignmentCard,
} from './../Components';
import { useAppSelector, useAppDispatch } from '../Redux/hooks';
import {
  ADD_ASSIGNMENT_TYPES,
  ADD_PENDING_SUBJECTS,
  ADD_SUBJECT,
  ADD_ASSIGNMENTS,
  ADD_META,
  HOME_TOUR_COUNTER,
  ADD_TODAY_ASSIGNMENTS,
  ADD_HOME_FILTERS,
  SET_SUBJECT,
} from '../Redux/Types';
import {
  GET_SUBJECTS,
  GET_ASSIGNMENT,
  GET_ASSIGNMENT_TYPE,
  GET_PENDING_SUBJECT,
  GET_META,
} from '../Constants';
import axios from './../Utils/axios';
import {
  useFocusEffect,
  useNavigation,
  useIsFocused,
} from '@react-navigation/native';
import Drawer from 'react-native-drawer';
import qs from 'qs';
import DropdownAlert, { DropdownAlertData, DropdownAlertType } from 'react-native-dropdownalert';

import {
  ADD_ASSIGNMENT_PATH,
  NOTIFICATION_PATH,
} from '../Navigation/Routes';

import moment from 'moment';

const Home = () => {
  const toastRef = useRef();
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);
  const [refreshing, setRefeshing] = useState(false);
  const [keyboardStatus, setKeyboardStatus] = useState(false);
  const [randomNumber, setRandomNumber] = useState(0);
  const filterValues = useAppSelector(state => state.metaReducer.homeFilters);
  const homeCounter = useAppSelector(state => state.tourReducer.homeCounter);
  const pendingSubjects = useAppSelector(
    state => state.subjectReducer.pendingSubjects,
  );
  const assignmentTypes = useAppSelector(
    state => state.assignmentReducer.assignmentTypes,
  );
  const todayAssignments = useAppSelector(
    state => state.assignmentReducer.todayAssignments,
  );
  const [assignmentsFiltered, setAssignmentFiltered] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterStatusText, setFilterStatusText] = useState(null);
  const [filterStatusButton, setFilterStatusButton] = useState(null);
  const [resetFilters, setResetFilters] = useState(false);

  const drawerRef = useRef();
  const [statusAssignment, setAssignmentStatus] = useState(null);
  const handleStatusAll = () => {
    setAssignmentStatus('all');
    handleFilter('assignment', {});
    setSearchText('');
  };

  const setFilterValues = e => {
    console.log('IS_CALLED');
    dispatch({
      type: ADD_HOME_FILTERS,
      payload: e,
    });
  };

  useEffect(() => {
    const emptyStatus = filterValues?.status || 'all';

    const buttonEmptyComp = emptyComponentData[emptyStatus]?.button;
    let EMPTY_BUTTON = emptyStatus ? buttonEmptyComp : undefined;

    let EMPTY_TEXT = emptyStatus
      ? emptyComponentData[emptyStatus]?.title
      : 'No Tasks Found';
    if (
      Boolean(filterValues?.type?.length) ||
      Boolean(filterValues?.startDate && filterValues?.endDate)
    ) {
      EMPTY_TEXT = 'No Tasks Found with selected Filters';
      EMPTY_BUTTON = (
        <CustomButton onPress={() => setResetFilters(!resetFilters)}>
          Remove Filters
        </CustomButton>
      );
    }

    setFilterStatusText(EMPTY_TEXT);
    setFilterStatusButton(EMPTY_BUTTON);
  }, [
    filterValues?.status,
    filterValues?.type,
    filterValues?.startDate,
    filterValues?.endDate,
  ]);

  const emptyComponentData = {
    all: {
      title: 'No tasks found',
      button: (
        <CustomButton onPress={() => navigation.navigate(ADD_ASSIGNMENT_PATH)}>
          Add a new task
        </CustomButton>
      ),
    },
    active: {
      title: "Horray! You've no tasks pending!",
      button: (
        <CustomButton onPress={handleStatusAll}>
          View All Tasks
        </CustomButton>
      ),
    },
    due: {
      title: "Horray! You've no tasks due!",
      button: (
        <CustomButton onPress={handleStatusAll}>
          View All Tasks
        </CustomButton>
      ),
    },
    completed: {
      title: "you've not completed any tasks",
      button: (
        <CustomButton onPress={handleStatusAll}>
          View All Tasks
        </CustomButton>
      ),
    },
  };

  const closeControlPanel = () => {
    drawerRef?.current?.close();
    setFilterOpen(true);
    console.log('CLOSED');
  };
  const openControlPanel = () => {
    drawerRef?.current?.open();
    setFilterOpen(false);
    setRandomNumber(new Date().getTime());
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!searchText) {
      handleSearchSubmit(null, null, true);
    }
  }, [searchText]);
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardStatus(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardStatus(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const getSubjects = async () => {
    try {
      const req = await axios({
        url: GET_SUBJECTS,

        method: 'GET',
      });
      dispatch({type: ADD_SUBJECT, payload: req.data});
    } catch (error) {
      toastRef?.current?.alertWithType('error', 'Error', error?.message);
    }
  };

  const getMetaData = async () => {
    try {
      const req = await axios({
        url: GET_META,

        method: 'GET',
      });
      dispatch({type: ADD_META, payload: req.data});
    } catch (error) {
      toastRef?.current?.alertWithType('error', 'Error', error?.message);
    }
  };
  const getAssignments = async (condition = 'subject', reqObj = {}) => {
    try {
      if (condition !== 'subject') {
        // setLoading(true);
      }
      console.log(reqObj, 'reqObj');
      const req = await axios({
        url: GET_ASSIGNMENT + qs.stringify(reqObj),

        method: 'GET',
      });
      if (condition !== 'subject') {
        setAssignmentFiltered([...req.data]);
        setLoading(false);
        setAssignmentStatus('assignment');
      } else {
        dispatch({type: ADD_ASSIGNMENTS, payload: req.data});
      }
      setLoading(false);
      setRefeshing(false);
    } catch (error) {
      setLoading(false);
      setRefeshing(false);
      console.log('ERRRRRR', error);
      toastRef?.current?.alertWithType('error', 'Error', error?.message);
    }
  };
  const getPendingSubject = async (reqObj = {status: 'active'}) => {
    console.log('PENDING', reqObj);
    try {
      const req = await axios({
        url: GET_PENDING_SUBJECT + qs.stringify(!reqObj ? {status: 'active'} : reqObj),

        method: 'GET',
      });

      dispatch({type: ADD_PENDING_SUBJECTS, payload: req.data});
      setLoading(false);
    } catch (error) {
      console.log(error, ' req.data');
      setAssignmentFiltered(null);
      toastRef?.current?.alertWithType('error', 'Error', error?.message);
      setLoading(false);
    }
  };
  const getAssignmentType = async () => {
    try {
      const req = await axios({
        url: GET_ASSIGNMENT_TYPE,

        method: 'GET',
      });
      dispatch({type: ADD_ASSIGNMENT_TYPES, payload: req.data});
    } catch (error) {
      toastRef?.current?.alertWithType('error', 'Error', error?.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getSubjects();
      getAssignmentType();

      if (pendingSubjects) {
        setLoading(false);
      }

      getTodaysAssignments();
    }, [isFocused]),
  );

  useFocusEffect(
    useCallback(() => {
      getPendingSubject(filterValues);
    }, [isFocused]),
  );
  useFocusEffect(
    useCallback(() => {
      console.log('assingment', filterValues);
      if (filterValues?.filterType == 'assignment') {
        getAssignments(filterValues?.filterType, filterValues);
      } else {
        getAssignments();
      }
    }, [filterValues, isFocused]),
  );

  useEffect(() => {
    getMetaData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      dispatch({
        type: SET_SUBJECT,
        payload: null,
      });
      const backAction = () => {
        if (filterOpen) {
          console.log(1, 'filterOpen');
          BackHandler.exitApp();
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

      return () => backHandler.remove();
    }, [filterOpen]),
  );
  const handleFilter = (filterType, filterAtr = {}) => {
    console.log('------------FILTER-------------');
    const reqObj = Object.entries(filterAtr).reduce(
      (a, [k, v]) => (v === null ? a : ((a[k] = v), a)),
      {},
    );
    setLoading(true);
    const finalObj = {...reqObj, filterType};
    if (!finalObj?.assignmentStatus) {
      finalObj.assignmentStatus = 'all';
    } else {
      // finalObj.status = finalObj.assignmentStatus
    }
    // setFilterValues(finalObj);
    if (filterType === 'subject') {
      setAssignmentFiltered(null);
      getPendingSubject(finalObj);
      setFilterValues(finalObj);
    } else {
      setFilterValues({...reqObj, filterType});
      getAssignments(filterType, reqObj);
    }
    closeControlPanel();
  };

  const handleSearchSubmit = (event, text, empty = false) => {
    console.log('handleSearchSubmit======', empty);
    if (empty && filterValues?.filterType === 'assignment') {
      getAssignments(filterValues?.filterType, {
        ...(filterValues || {}),
      });
      return;
    }
    if (text || searchText) {
      getAssignments('assignment', {
        title: text || searchText,
        ...(filterValues || {}),
      });
    } else {
      // setAssignmentFiltered(null);
      if (filterValues) {
        getAssignments(filterValues.filterType, {
          ...filterValues,
        });
      }
    }
  };

  const sortedList = assignmentsFiltered
    ? assignmentsFiltered?.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      )
    : pendingSubjects?.sort((a, b) => {
        return (
          new Date(a?.Assignment?.dueDate).getTime() -
          new Date(b?.Assignment?.dueDate).getTime()
        );
      });

  const handleDataRefresh = () => {
    setRefeshing(true);
    if (filterValues) {
      getAssignments(filterValues.filterType, {
        ...filterValues,
        // title: searchText,
      });
    } else {
      getAssignments();
    }
  };

  useEffect(() => {
    if (homeCounter === 1) {
      setTimeout(() => {
        navigation.openDrawer();
      }, 2000);
    }
  }, [homeCounter]);

  const getTodaysAssignments = async () => {
    try {
      const reqObj = {
        startDate: new Date(moment().startOf('day')),
        endDate: new Date(moment().endOf('day')),
        status: 'active',
      };

      // console.log(reqObj);
      const req = await axios({
        url: GET_ASSIGNMENT + qs.stringify(reqObj),

        method: 'GET',
      });

      dispatch({type: ADD_TODAY_ASSIGNMENTS, payload: req.data});
    } catch (error) {
      toastRef?.current?.alertWithType('error', 'Error', error?.message);
    }
  };

  // console.log('homeContainer', filterValues);

  // console.log(homeCounter, 'todayAssignments');

  let alert = (data?: DropdownAlertData) => new Promise<DropdownAlertData>(res => res(data || {}));

  return (
    <View style={styles.container}>
      <Drawer
        onOpen={() => setIsDrawerOpen(true)}
        onClose={() => setIsDrawerOpen(false)}
        ref={drawerRef}
        type="overlay"
        side="right"
        content={
          <HomeSideBar
            onClose={closeControlPanel}
            handleSubmit={handleFilter}
            loading={loading}
            didClose={randomNumber}
            filterValues={filterValues}
            statusAssignment={statusAssignment}
            changeType={filterType}
            resetFilters={resetFilters}
          />
        }
        tapToClose={true}
        openDrawerOffset={0.3} // 20% gap on the right side of drawer
        panCloseMask={0.2}
        closedDrawerOffset={-10}
        styles={drawerStyles}
        tweenHandler={ratio => ({
          main: {opacity: (2 - ratio) / 2},
        })}>
        <Header
          title="Home"
          iconRight="bell"
          hasLeftBtn
          onBackBtn={() => navigation.navigate(NOTIFICATION_PATH)}
          showNotification
        />
        <SearchBar
          placeholder="Search for category"
          value={searchText}
          setValue={setSearchText}
          returnKeyType="search"
          onSubmitEditing={handleSearchSubmit}
        />
        {Boolean(!assignmentsFiltered?.length) &&
          Boolean(todayAssignments?.length) && (
            <View style={styles.dueToday}>
              <Text style={styles.title}>Due Today</Text>
              <FlatList
                data={todayAssignments}
                horizontal
                contentContainerStyle={{flexGrow: 1, backgroundColor: '#fff'}}
                ListHeaderComponent={() => {
                  return <></>;
                }}
                showsHorizontalScrollIndicator={false}
                renderItem={({item}) => (
                  <MiniAssignmentCard
                    data={item}
                    image={item?.subject?.image}
                  />
                )}
                keyExtractor={item => item._id}
              />
            </View>
          )}

        <View style={{flex: 8}}>
          <FilterComponent
            title={assignmentsFiltered ? 'Tasks' : 'Categories'}
            onPress={openControlPanel}
          />
          {loading ? (
            <Loading />
          ) : (
            <View style={styles.flatlistContainer}>
              <FlatList
                data={sortedList}
                contentContainerStyle={{flexGrow: 1}}
                renderItem={({item, index}) =>
                  assignmentsFiltered ? (
                    <AssignmentCard
                      data={item}
                      index={index}
                      image={item?.subject?.image}
                    />
                  ) : (
                    <SubjectCard data={item} index={index} />
                  )
                }
                keyExtractor={item => item._id}
                refreshing={refreshing}
                onRefresh={handleDataRefresh}
                ListEmptyComponent={() => (
                  <EmptyComponent
                    text={filterStatusText}
                    button={filterStatusButton}
                  />
                )}
              />
            </View>
          )}
          {!keyboardStatus && <Footer addPath={ADD_ASSIGNMENT_PATH} />}
        </View>
      </Drawer>
      <DropdownAlert alert={func => (alert = func)} />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    paddingRight: 10,
  },
  flatlistContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    // fontWeight: '800',
    fontWeight: Platform.OS === 'ios' ? 'bold' : '200',
    fontFamily: 'AvenirArabic-Heavy',
    color: '#222',
    paddingHorizontal: 5,
    marginBottom: 5,
  },
  dueToday: {
    paddingHorizontal: 15,
  },
});

const drawerStyles = {
  drawer: {shadowColor: '#000000', shadowOpacity: 0.8, shadowRadius: 3},
  // main: {paddingLeft: 3},
};