import React, { useState, useEffect, useRef } from "react";

import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  IconButton,
  useTheme,
  TextInput,
  Text,
  List,
  Checkbox,
} from "react-native-paper";
import Entypo from "react-native-vector-icons/Entypo";
import { RadioButton } from "react-native-paper";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { CustomButton } from ".";
import TouchableInput from "./Inputs/TouchableInput";
import { useSelector } from "react-redux";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import { filter } from "lodash";
const SideSearch = ({
  handleSubmit,
  onClose,
  loading,
  state = "all",
  didClose,
  isGoal = false,
  label,
  filterValues,
}) => {
  const theme = useTheme();
  const primaryColor = theme.colors.primary;
  const [subjectFilter, setSubjectFilter] = useState(state || "all");
  const [expanded, setExpanded] = useState("subject");
  const [filterValue, setFilterValue] = useState(state || "all");
  const [subjectFilters] = useState([
    {
      title: "All Tasks",
      state: "all",
    },
    {
      title: "Pending Tasks",
      state: "active",
    },
    {
      title: "Due Tasks",
      state: "due",
    },
    {
      title: "Completed Tasks",
      state: "completed",
    },
  ]);

  const [goalFilter] = useState([
    {
      title: "All Goals",
      state: "all",
    },
    {
      title: "Pending Goals",
      state: "active",
    },
    {
      title: "Due Goals",
      state: "due",
    },
    {
      title: "Completed Goals",
      state: "completed",
    },
  ]);

  const handleClose = () => {
    setSubjectFilter(filterValues || filterValue);
    onClose();
  };

  const handleChange = (state) => {
    setSubjectFilter(state);
  };

  const handleApply = () => {
    setFilterValue(subjectFilter);
    handleSubmit({
      status: subjectFilter === "all" ? null : subjectFilter,
    });
  };
  useEffect(() => {
    if (didClose !== 0) {
      handleClose(null);
    }
  }, [didClose]);

  useEffect(() => {
    if (filterValues) {
      setSubjectFilter(filterValues);
    }
    console.log("TESTSTSS", filterValues);
  }, [filterValues]);
  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
      }}
      style={styles.scroll}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Filter Menu</Text>
          <IconButton icon="close" onPress={handleClose} />
        </View>
        <List.Section>
          <List.Accordion
            expanded={expanded === "subject"}
            // onPress={() => setExpanded('subject')}
            style={[styles.section]}
            theme={{ colors: { text: "#fff" } }}
            title={
              <View style={styles.sectionHeader}>
                {/* <RadioButton color={primaryColor} /> */}
                <Text style={styles.sectionHeaderText}>
                  {label ? label : "Show By Task Status"}
                </Text>
              </View>
            }
          >
            {(isGoal ? goalFilter : subjectFilters).map((filter) => {
              return (
                <List.Item
                  style={{ paddingVertical: 0, paddingHorizontal: 10 }}
                  title={
                    <TouchableOpacity
                      style={styles.sectionHeader}
                      onPress={() => handleChange(filter.state)}
                    >
                      <RadioButton.Android
                        color={primaryColor}
                        status={
                          filter.state === subjectFilter
                            ? "checked"
                            : "unchecked"
                        }
                        disabled
                      />
                      <Text style={styles.sectionChildText}>
                        {filter.title}
                      </Text>
                    </TouchableOpacity>
                  }
                />
              );
            })}
          </List.Accordion>
        </List.Section>
      </View>
      <View style={styles.btnContainer}>
        <View style={styles.btn}>
          <CustomButton
            style={{ padding: 0 }}
            loading={loading}
            onPress={() => handleApply()}
          >
            Apply
          </CustomButton>
        </View>
        <View style={styles.btn}>
          <CustomButton
            onPress={() => setSubjectFilter(state)}
            style={{ padding: 0, backgroundColor: "#f0f0f0" }}
            labelColor={"#222"}
          >
            Clear
          </CustomButton>
        </View>
      </View>
    </ScrollView>
  );
};

export default SideSearch;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 11,
    },
    shadowOpacity: 0.57,
    shadowRadius: 15.19,

    elevation: 23,
  },
  header: {
    flexDirection: "row",
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingRight: 0,
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomColor: "#f7f7f7",
    borderBottomWidth: 1,
    marginBottom: 60,
  },
  headerText: {
    fontSize: 20,
    // textAlign: 'center',
    fontFamily: "AvenirArabic-Heavy",
    // fontWeight: 'bold',
  },
  section: {
    backgroundColor: "#fff",
    borderBottomColor: "#f7f7f7",
    borderBottomWidth: 1,
    borderTopColor: "#f7f7f7",
    borderTopWidth: 1,
    paddingVertical: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    // paddingVertical: 10,
    // paddingHorizontal: 15,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontFamily: "AvenirArabic-Heavy",
    // fontWeight: 'bold',
  },
  sectionChildText: {
    // fontWeight: 'bold',
    fontFamily: "AvenirArabic-Heavy",

    fontSize: 14,
  },
  dateContainer: {
    marginVertical: 5,
    flexDirection: "row",
  },
  date: {
    flex: 1,
  },
  btnContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  btn: {
    flex: 1,
    padding: 3,
  },
});
