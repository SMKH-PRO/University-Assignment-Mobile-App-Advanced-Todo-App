import React, {useState, useEffect, useRef, useCallback} from 'react';

import {View, StyleSheet, FlatList, Keyboard, BackHandler} from 'react-native';
import {Text} from 'react-native-paper';
import {
  Header,
  SearchBar,
  FilterComponent,
  GoalCard,
  Toast,
  EmptyComponent,
  Loading,
  Footer,
  GoalSideBar,
  CustomButton,
} from './../Components';
import faker from 'faker';
import { useAppSelector, useAppDispatch } from '../Redux/hooks';
import axios from './../Utils/axios';
import {GET_GOALS} from '../Constants';
import {ADD_GOALS, HOME_TOUR_COUNTER} from '../Redux/Types';
import {ADD_GOAL_PATH, NOTIFICATION_PATH} from '../Navigation/Routes';
import Drawer from 'react-native-drawer';
import qs from 'qs';
import {createFilter} from '../Utils/createFilter';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import DropdownAlert, { DropdownAlertData, DropdownAlertType } from 'react-native-dropdownalert';

const Goals = () => {
  const drawerRef = useRef();
  let alert = (data?: DropdownAlertData) => new Promise<DropdownAlertData>(res => res(data || {}));

  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const [filteredGoals, setFilteredGoals] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState(null);
  const [keyboardStatus, setKeyboardStatus] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [randomNumber, setRandomNumber] = useState(0);
  const [isMounted, setMounted] = useState(false);
  const goals = useAppSelector(state => state.goalReducer.goals);
  const homeCounter = useAppSelector(state => state.tourReducer.homeCounter);
  const handleStatusAll = () => {
    setFilterStatus('all');
    handleFilter({});
  };
  const emptyComponentData = {
    all: {
      title: 'No Goals Found',
      button: (
        <CustomButton onPress={() => navigation.navigate(ADD_GOAL_PATH)}>
          Add an goal
        </CustomButton>
      ),
    },
    active: {
      title: "Horray! You've no goals pending!",
      button: (
        <CustomButton onPress={handleStatusAll}>View All goals</CustomButton>
      ),
    },
    due: {
      title: "Horray! You've no goals due!",
      button: (
        <CustomButton onPress={handleStatusAll}>View All goals</CustomButton>
      ),
    },
    completed: {
      title: "you've not completed any goals",
      button: (
        <CustomButton onPress={handleStatusAll}>View All goals</CustomButton>
      ),
    },
  };
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
  useFocusEffect(
    useCallback(() => {
      if (!goals) {
        getGoals();
      } else {
        setLoading(false);
        getGoals(filterStatus);
      }
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
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

      return () => backHandler.remove();
    }, [filterOpen]),
  );

  const getGoals = async (status, refresh) => {
    try {
      if (refresh) {
        setRefreshing(true);
      }
      const req = await axios({url: GET_GOALS + qs.stringify(status ? {status} : {})});
      console.log(GET_GOALS + qs.stringify({status}), 'SELECTEDSTATUS', req?.data?.length);

      setLoading(false);
      setRefreshing(false);

      // if (Boolean(status)) {
        setFilteredGoals([...req.data]);
      // } else {
        dispatch({
          type: ADD_GOALS,
          payload: req.data,
        });
        // setFilteredGoals(null);

      // }
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
  const closeControlPanel = () => {
    drawerRef.current.close();
    setFilterOpen(true);
  };
  const openControlPanel = () => {
    drawerRef.current.open();
    setFilterOpen(false);
    setRandomNumber(new Date().getTime());
  };
  const handleFilter = (filterAtr = {}) => {
    const reqObj = Object.entries(filterAtr).reduce(
      (a, [k, v]) => (v === null ? a : ((a[k] = v), a)),
      {},
    );
    setLoading(true);
    setFilterStatus(reqObj.status);
    // console.log(reqObj.status, 'reqObj.status');
    getGoals(reqObj.status);
    closeControlPanel();
  };
  // console.log(goals, 'op');
  const filteredData = (filteredGoals || goals)?.filter(createFilter(searchText, ['title']));
  const sortedGoals = filteredData?.sort(
    (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const emptyStatus = filterStatus || 'all';
  const buttonEmptyComp = emptyComponentData[emptyStatus]?.button;
  const EMPTY_BUTTON = emptyStatus ? buttonEmptyComp : undefined;

  const EMPTY_TEXT = emptyStatus
    ? emptyComponentData[emptyStatus]?.title
    : 'No Tasks Found';

  console.log(emptyStatus, 'OPCONTED', filteredGoals?.length,goals?.length);
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
            filterValues={emptyStatus}
            label={'Show by Goal Status'}
            isGoal
            // state="active"
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
          title="Goals"
          iconRight="bell"
          showNotification
          hasLeftBtn
          onBackBtn={() => navigation.navigate(NOTIFICATION_PATH)}
        />
        <SearchBar
          placeholder="Search for Goals"
          value={searchText}
          setValue={setSearchText}
        />
        <FilterComponent title="Goals" onPress={openControlPanel} />
        {loading ? (
          <Loading />
        ) : (
          <FlatList
            data={sortedGoals}
            contentContainerStyle={{flexGrow: 1}}
            renderItem={({item}) => <GoalCard data={item} />}
            keyExtractor={item => item._id}
            ListEmptyComponent={() => (
              <EmptyComponent text={EMPTY_TEXT} button={EMPTY_BUTTON} />
            )}
            refreshing={refreshing}
            onRefresh={() => getGoals(filterStatus, true)}
          />
        )}

        {!keyboardStatus && <Footer addPath={ADD_GOAL_PATH} />}
      </Drawer>
      <DropdownAlert alert={func => (alert = func)} />
    </View>
  );
};

export default Goals;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
});

const drawerStyles = {
  drawer: {shadowColor: '#000000', shadowOpacity: 0.8, shadowRadius: 3},
  // main: {paddingLeft: 3},
};
