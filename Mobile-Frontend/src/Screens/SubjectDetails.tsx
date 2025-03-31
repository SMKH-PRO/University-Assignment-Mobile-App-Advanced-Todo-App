import React, {useState, useEffect, useRef, useCallback} from 'react';
import {View, StyleSheet, FlatList} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {
  Header,
  SearchBar,
  FilterComponent,
  AssignmentCard,
  Toast,
  GoalSideBar,
  Loading,EmptyComponent,
} from './../Components';
import axios from './../Utils/axios';
import {GET_ASSIGNMENTS_SUBJECT} from '../Constants';
import {ADD_SUBJECT_DETAILS, SET_SUBJECT} from '../Redux/Types';
import {useDispatch, useSelector} from 'react-redux';
import qs from 'qs';
import Drawer from 'react-native-drawer';
import DropdownAlert, { DropdownAlertData, DropdownAlertType } from 'react-native-dropdownalert';
import {useNavigation} from '@react-navigation/native';
import {ADD_SUBJECT_PATH} from './../Navigation/Routes';
import {useFocusEffect} from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
const SubjectDetails = ({route}) => {
  const {subjectId} = route.params;
  const drawerRef = useRef();
  let alert = (data?: DropdownAlertData) => new Promise<DropdownAlertData>(res => res(data || {}));
  const navigation = useNavigation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const primaryColor = theme.colors.primary;
  const iconColor = theme.colors.icon;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const subjectDetails = useSelector(
    state => state.subjectReducer.subjectDetails?.[subjectId],
  );

  const [randomNumber, setRandomNumber] = useState(0);
  const [filterStatus, setFilterStatus] = useState(null);

  const [filterAssignments, setFilterAssignments] = useState(null);
  const subject = useSelector(state =>
    state.subjectReducer.subjects?.find(v => v._id === subjectId),
  );
  const getSubjectDetails = async refresh => {
    try {
      if (refresh) {
        setRefreshing(true);
      }
      const reqObj = {
        subject: subjectId,
      };
      const req = await axios({
        url: GET_ASSIGNMENTS_SUBJECT + qs.stringify(reqObj),

        method: 'GET',
      });
      dispatch({type: ADD_SUBJECT_DETAILS, payload: req.data, subjectId});
      setLoading(false);
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
  const closeControlPanel = () => {
    drawerRef.current.close();
  };
  const openControlPanel = () => {
    drawerRef.current.open();
    setRandomNumber(new Date().getTime());
  };
  useFocusEffect(
    useCallback(() => {
      dispatch({
        type: SET_SUBJECT,
        payload: null,
      });
      if (subjectDetails) {
        setLoading(false);
      }
      getSubjectDetails();
    }, []),
  );

  const handleFilter = (filterAtr = {}) => {
    const reqObj = Object.entries(filterAtr).reduce(
      (a, [k, v]) => (v === null ? a : ((a[k] = v), a)),
      {},
    );
    console.log(reqObj, 'FILTer', filterArr);

    if (!reqObj.status) {
      setFilterAssignments(null);
      closeControlPanel();
      setFilterStatus(reqObj.status);
      return;
    }
    setFilterStatus(reqObj.status);

    const filterArr = subjectDetails.filter(v => v.status === reqObj.status);
    setFilterAssignments(filterArr);
    closeControlPanel();
  };

  const sortedAssignments = (filterAssignments || subjectDetails)?.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const emptyComponentData = {
    all: {
      title: 'you have no tasks',
    },
    active: {
      title: "Horray! You've no task pending!",
    },
    due: {
      title: "Horray! You've no task due!",
    },
    completed: {
      title: "you've not completed any tasks",
    },
  };

  const emptyStatus = filterStatus || 'all';
  console.log(filterStatus);
  const EMPTY_TEXT = emptyStatus
    ? emptyComponentData[emptyStatus]?.title
    : 'No Tasks Found';

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
          title={'Task'}
          iconRight={() => (
            <FontAwesome name="pencil-square-o" size={20} color={iconColor} />
          )}
          iconLeft="close"
          hasLeftBtn
          onLeftBtn={() => navigation.goBack()}
          onBackBtn={() => navigation.navigate(ADD_SUBJECT_PATH, {subjectId})}
        />
        <SearchBar
          placeholder="Search for Task"
          setValue={setSearchText}
          value={searchText}
        />
        {loading ? (
          <Loading />
        ) : (
          <FlatList
            data={sortedAssignments}
            renderItem={({item}) => (
              <AssignmentCard data={item} image={subject.image} />
            )}
            contentContainerStyle={{flexGrow: 1}}
            keyExtractor={item => item._id}
            refreshing={refreshing}
            onRefresh={() => getSubjectDetails(true)}
            ListHeaderComponent={() => {
              return (
                <>
                  <FilterComponent
                    title={subject.title}
                    onPress={openControlPanel}
                  />
                </>
              );
            }}
            ListEmptyComponent={() => (
              <EmptyComponent text={EMPTY_TEXT} />
            )}
          />
        )}
      </Drawer>
      <DropdownAlert alert={func => (alert = func)} />
    </View>
  );
};

export default SubjectDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
const drawerStyles = {
  drawer: {shadowColor: '#000000', shadowOpacity: 0.8, shadowRadius: 3},
  // main: {paddingLeft: 3},
};
