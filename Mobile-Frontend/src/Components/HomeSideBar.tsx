import React, {useState, useEffect} from 'react';

import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import {IconButton, useTheme, Text, List, Checkbox} from 'react-native-paper';
import {RadioButton} from 'react-native-paper';
import {CustomButton} from '.';
import TouchableInput from './Inputs/TouchableInput';
import {useSelector} from 'react-redux';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';

const SideSearch = ({
  handleSubmit,
  onClose,
  loading,
  didClose,
  filterValues,
  statusAssignment,
  changeType,
  resetFilters,
}) => {
  const theme = useTheme();
  const primaryColor = theme.colors.primary;
  const [subjectFilter, setSubjectFilter] = useState('active');
  const [assignmentStatus, setAssignmentStatus] = useState('active');
  const [assignmentType, setAssignmentType] = useState({});
  const [dateRange, setDateRange] = useState({});
  const [expanded, setExpanded] = useState('subject');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [atGlance, setAtGlance] = useState(null);
  const [isStartDateVisible, setStartDateVisibility] = useState(false);
  const [isRemindDateVisible, setRemindDateVisibility] = useState(false);
  const [isEndDateVisible, setEndDateVisibility] = useState(false);
  const [mounted, setMounted] = useState(false);
  const assignmentTypes = useSelector(
    state => state.assignmentReducer.assignmentTypes,
  );

  const [values, setValues] = useState({
    subjectFilter: 'active',
    assignmentType: {},
    assignmentStatus: 'active',
    expanded: 'subject',
    startDate: null,
    endDate: null,
    atGlance: null,
  });

  const [subjectFilters] = useState([
    {
      title: 'All Subject',
      state: 'all',
    },
    {
      title: 'Pending',
      state: 'active',
    },
    {
      title: 'Due Tasks',
      state: 'due',
    },
    {
      title: 'Completed',
      state: 'completed',
    },
  ]);
  const [assignmentTimes] = useState([
    {
      title: 'Today',
      state: 'day',
    },
    {
      title: 'This week',
      state: 'week',
    },
    {
      title: 'This Month',
      state: 'month',
    },
  ]);

  const handleStartDatePick = date => {
    setStartDateVisibility(false);
    setStartDate(date);
    setAtGlance(null);
    if (endDate) {
      if (endDate.getTime() < date.getTime()) {setEndDate(date);}
    }
  };
  const handleEndDatePick = date => {
    setEndDateVisibility(false);
    setAtGlance(null);
    setEndDate(date);
  };

  const handleClear = (apply = false) => {
    setExpanded('subject');
    setSubjectFilter('active');
    setAssignmentStatus('active');
    setAssignmentType({});
    setStartDate(null);
    setEndDate(null);

    if (apply === true) {
      console.log('HANDLE FILTER');
      handleFilter(apply);
    }
  };

  const handleAssignmentType = data => {
    const stateObj = assignmentType;
    if (stateObj[data._id]) {
      delete stateObj[data._id];
    } else {
      stateObj[data._id] = data;
    }
    setAssignmentType({
      ...stateObj,
    });
  };

  const handleFilter = (apply = false) => {
    const reqObj =
      expanded === 'subject'
        ? {
            status: subjectFilter === 'all' ? null : subjectFilter,
          }
        : {
            status: assignmentStatus === 'all' ? null : assignmentStatus,
            type: Object.keys(assignmentType),
            startDate,
            endDate,
          };

    if (atGlance) {
      reqObj.startDate = new Date(moment().startOf(atGlance));
      reqObj.endDate = new Date(moment().endOf(atGlance));
    }
    if (apply === true) {
      console.log('APPLY TRUE');
      setValues({
        subjectFilter: 'active',
        assignmentType: {},
        assignmentStatus: 'active',
        expanded: 'subject',
        startDate: null,
        endDate: null,
        atGlance: null,
      });
      handleSubmit('subject', {
        subjectFilter: 'active',
        assignmentType: {},
        assignmentStatus: 'active',
        expanded: 'subject',
        startDate: null,
        endDate: null,
        atGlance: null,
      });

      return;
    }

    console.log('AFTER AFTER');
    if (expanded === 'subject') {
      setValues({
        ...values,
        subjectFilter,
        expanded,
      });
      handleSubmit(expanded, reqObj);
    } else {
      setValues({
        subjectFilter,
        assignmentType,
        assignmentStatus,
        expanded,
        startDate,
        endDate,
        atGlance,
      });
      handleSubmit(expanded, reqObj);
    }
  };

  const handleClose = (shouldClose = true) => {
    console.log(values, 'OPOPOP');
    setExpanded(values.expanded);
    setSubjectFilter(values.subjectFilter);
    setAssignmentStatus(values.assignmentStatus);
    setAssignmentType(values.assignmentType);
    setStartDate(values.startDate);
    setEndDate(values.endDate);
    setAtGlance(values.atGlance);

    if (shouldClose) {
      onClose();
    }
  };

  useEffect(() => {
    if (didClose !== 0) {
      handleClose(null);
    }
    console.log(statusAssignment, 'OH CANT IT BE');
    if (statusAssignment) {
      setValues({
        ...values,
        assignmentStatus: statusAssignment,
        expanded: 'assignment',
      });
    }
  }, [didClose]);

  useEffect(() => {
    if (statusAssignment) {
      setValues({
        ...{
          ...values,
          assignmentStatus: statusAssignment,
          expanded: 'assignment',
        },
      });
      setAssignmentStatus(statusAssignment);
    }
  }, [statusAssignment]);

  const handleGlance = state => {
    setAtGlance(state === atGlance ? null : state);
  };

  useEffect(() => {
    if (mounted) {
      console.log('HEHEHHEHHEHE');
      handleClear(true);
    } else {
      setMounted(true);
    }
  }, [resetFilters]);

  const startDateStr = startDate ? moment(startDate).format('DD MMM YYYY') : '';
  const endDateStr = endDate ? moment(endDate).format('DD MMM YYYY') : '';
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
        style={styles.scroll}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Filter Menu</Text>
            <IconButton icon="close" onPress={handleClose} />
          </View>
          <List.Section style={{flex: 1, paddingRight: 20}}>
              <List.Accordion
                style={[styles.section]}
                title={
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionHeaderText]}>
                      Filter By Status
                    </Text>
                  </View>
                }>
                <List.Item
                  style={{paddingVertical: 0, paddingHorizontal: 20}}
                  title={
                    <TouchableOpacity
                      style={styles.sectionHeader}
                      onPress={() =>
                        setAssignmentStatus(
                          assignmentStatus === 'all' ? null : 'all',
                        )
                      }>
                      <RadioButton.Android
                        color={primaryColor}
                        status={
                          assignmentStatus === 'all' ? 'checked' : 'unchecked'
                        }
                        disabled
                      />
                      <Text style={styles.sectionChildText}>All</Text>
                    </TouchableOpacity>
                  }
                />
                <List.Item
                  style={{paddingVertical: 0, paddingHorizontal: 20}}
                  title={
                    <TouchableOpacity
                      style={styles.sectionHeader}
                      onPress={() =>
                        setAssignmentStatus(
                          assignmentStatus === 'active' ? null : 'active',
                        )
                      }>
                      <RadioButton.Android
                        color={primaryColor}
                        status={
                          assignmentStatus === 'active'
                            ? 'checked'
                            : 'unchecked'
                        }
                        disabled
                      />
                      <Text style={styles.sectionChildText}>Pending</Text>
                    </TouchableOpacity>
                  }
                />
                <List.Item
                  style={{paddingVertical: 0, paddingHorizontal: 20}}
                  title={
                    <TouchableOpacity
                      style={styles.sectionHeader}
                      onPress={() =>
                        setAssignmentStatus(
                          assignmentStatus === 'due' ? null : 'due',
                        )
                      }>
                      <RadioButton.Android
                        color={primaryColor}
                        status={
                          assignmentStatus === 'due' ? 'checked' : 'unchecked'
                        }
                        disabled
                      />
                      <Text style={styles.sectionChildText}>Due</Text>
                    </TouchableOpacity>
                  }
                />
                <List.Item
                  style={{paddingVertical: 0, paddingHorizontal: 20}}
                  title={
                    <TouchableOpacity
                      style={styles.sectionHeader}
                      onPress={() =>
                        setAssignmentStatus(
                          assignmentStatus === 'completed' ? null : 'completed',
                        )
                      }>
                      <RadioButton.Android
                        color={primaryColor}
                        status={
                          assignmentStatus === 'completed'
                            ? 'checked'
                            : 'unchecked'
                        }
                        disabled
                      />
                      <Text style={styles.sectionChildText}>Completed</Text>
                    </TouchableOpacity>
                  }
                />
              </List.Accordion>
              {/* <List.Accordion
                style={[styles.section, , {paddingLeft: 20}]}
                title={
                  <TourGuideZone
                    zone={10}
                    text={`When selected, Tasks that are of selected type(s) will appear. `}
                    borderRadius={16}>
                    <View style={styles.sectionHeader}>
                      <Text style={[styles.sectionHeaderText]}>
                        Filter By Type
                      </Text>
                    </View>
                  </TourGuideZone>
                }>
                {assignmentTypes?.map(type => {
                  return (
                    <List.Item
                      style={{paddingVertical: 0, paddingHorizontal: 20}}
                      title={
                        <TouchableOpacity
                          style={styles.sectionHeader}
                          onPress={() => handleAssignmentType(type)}>
                          <Checkbox.Android
                            color={primaryColor}
                            status={
                              assignmentType?.[type._id]
                                ? 'checked'
                                : 'unchecked'
                            }
                            disabled
                          />
                          <Text style={styles.sectionChildText}>
                            {type.title}
                          </Text>
                        </TouchableOpacity>
                      }
                    />
                  );
                })}
              </List.Accordion> */}

              <List.Accordion
                style={[styles.section]}
                title={
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionHeaderText]}>
                      Filter By Time
                    </Text>
                  </View>
                }>
                <View
                  style={[
                    Platform.OS === 'ios' ? {flex: 1} : {},
                    {paddingHorizontal: 10},
                  ]}>
                  <View style={styles.dateContainer}>
                    <View style={[styles.date]}>
                      <TouchableInput
                        value={startDateStr}
                        label="Start Date"
                        onPress={() => setStartDateVisibility(true)}
                        containerStyle={styles.dateInput}
                      />
                    </View>
                    <View style={[styles.date]}>
                      <TouchableInput
                        value={endDateStr}
                        label="End Date"
                        onPress={() => setEndDateVisibility(true)}
                        style={{padding: 0}}
                        containerStyle={styles.dateInput}
                      />
                    </View>
                  </View>
                  <View style={styles.timesContainer}>
                    {assignmentTimes?.map(time => {
                      return (
                        <TouchableOpacity
                          style={styles.sectionHeader}
                          onPress={() => handleGlance(time.state)}>
                          <RadioButton.Android
                            color={primaryColor}
                            status={
                              time.state === atGlance ? 'checked' : 'unchecked'
                            }
                            disabled
                          />
                          <Text style={styles.sectionChildText}>
                            {time.title}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </List.Accordion>
       
          </List.Section>
        </View>
        <DateTimePickerModal
          isVisible={isStartDateVisible}
          mode="date"
          onConfirm={handleStartDatePick}
          onCancel={() => setStartDateVisibility(false)}
          // minimumDate={new Date()}
          date={startDate || new Date()}
        />
        <DateTimePickerModal
          isVisible={isEndDateVisible}
          mode="date"
          onConfirm={handleEndDatePick}
          onCancel={() => setEndDateVisibility(false)}
          date={endDate || new Date()}
          minimumDate={startDate || new Date()}
        />
      </ScrollView>
      <View style={styles.btnContainer}>
        <View style={styles.btn}>
          <CustomButton
            style={{padding: 0}}
            loading={loading}
            onPress={() => handleFilter()}>
            Apply
          </CustomButton>
        </View>
        <View style={styles.btn}>
          <CustomButton
            onPress={() => handleClear()}
            style={{padding: 0, backgroundColor: '#f0f0f0'}}
            labelColor={'#222'}>
            Clear
          </CustomButton>
        </View>
      </View>
    </View>
  );
};

export default SideSearch;

const styles = StyleSheet.create({
  timesContainer: {
    flexDirection: 'column',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginRight: -10,
    elevation: 23,
  },
  scroll: {
    marginRight: -10,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#f7f7f7',
    borderBottomWidth: 1,
    marginBottom: 60,
  },
  headerText: {
    fontSize: 20,
    fontFamily: 'AvenirArabic-Heavy',
  },
  section: {
    backgroundColor: '#fff',
    borderBottomColor: '#f7f7f7',
    borderBottomWidth: 1,
    borderTopColor: '#f7f7f7',
    borderTopWidth: 1,
    paddingVertical: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontFamily: 'AvenirArabic-Heavy',
  },
  sectionChildText: {
    fontFamily: 'AvenirArabic-Heavy',
    fontSize: 14,
  },
  dateContainer: {
    marginVertical: 5,
    flexDirection: 'row',
    maxHeight: 70,
  },
  date: {
    minWidth: 125,
    flex: 1,
    maxHeight: 55,
    paddingBottom: 80,
  },
  btnContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  btn: {
    flex: 1,
    padding: 3,
  },
  dot: {
    width: 20,
    height: 20,
    marginRight: 5,
    borderRadius: 10,
  },
  dateInput: {maxHeight: 56},
});
