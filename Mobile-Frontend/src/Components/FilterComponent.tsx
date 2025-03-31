import React from 'react';

import {View, StyleSheet, Image, TouchableOpacity, Text} from 'react-native';

import {IconButton, Title} from 'react-native-paper';
import FILTERIMAGE from './../Assets/Images/Filter.png';

const FilterComponent = ({title, onPress}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity onPress={onPress}>
        <Image source={FILTERIMAGE} style={{height: 30, width: 30}} />
      </TouchableOpacity>
    </View>
  );
};

export default FilterComponent;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 20,
    // fontWeight: '800',
    // fontWeight: 'bold',
    fontFamily: 'AvenirArabic-Heavy',
    color: '#222',
  },
});
