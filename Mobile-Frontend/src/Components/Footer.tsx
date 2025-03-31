import React, { useState } from 'react';

import { Text, useTheme } from 'react-native-paper';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import HOME from './../Assets/Images/home.png';
import STEP from './../Assets/Images/step.png';
import GOAL from './Svgs/GoalSvg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import {
  ADD_ASSIGNMENT_PATH,
  GOALS_PATH,
  HOME_PATH,
  ADD_GOAL_PATH,
} from './../Navigation/Routes';

const Footer = ({ addPath }) => {
  const navigation = useNavigation();
  const theme = useTheme();
  const primaryColor = theme.colors.primary;
  const onHomeScreen = ADD_GOAL_PATH !== addPath;

  const goalIcon = <Image source={STEP} style={styles.image} resizeMode="contain" />;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate(HOME_PATH)}>
        <Image source={HOME} style={styles.image} />
      </TouchableOpacity>

      <View style={styles.item}>
        <TouchableOpacity
          onPress={() => navigation.navigate(addPath)}
          style={[styles.midBtn, { backgroundColor: primaryColor }]}>
          <MaterialCommunityIcons name="plus" color="#fff" size={27} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.item]}
        onPress={() => navigation.navigate(GOALS_PATH)}>
        {goalIcon}
      </TouchableOpacity>
    </View>
  );
};

export default Footer;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderWidth: 3,
    borderColor: '#f0f0f0',
    borderRadius: 25,
    borderBottomWidth: 0,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 23,
    height: 23,
    resizeMode: 'contain',
  },
  midBtn: {
    width: 55,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    position: 'absolute',
    bottom: 10,
  },
});
