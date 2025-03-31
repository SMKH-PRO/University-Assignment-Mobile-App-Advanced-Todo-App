import React from 'react';

import {Text, useTheme, Checkbox} from 'react-native-paper';

import {View, TouchableOpacity, StyleSheet} from 'react-native';

import {List} from 'react-native-paper';
import SubjectAssignment from './SubjectAssignment';
const GoalSubject = ({data, title}) => {
  return (
    <List.Accordion
      title={title}
      style={[styles.container, styles.padding]}
      titleStyle={styles.title}>
      {data.map(assignment => {
        return <SubjectAssignment key={assignment._id} data={assignment} />;
      })}
    </List.Accordion>
  );
};

export default GoalSubject;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    // fontWeight: 'bold',
    color: '#222',
    fontFamily: 'AvenirArabic-Heavy',

  },
  padding: {
    paddingHorizontal: 15,
  },
});
