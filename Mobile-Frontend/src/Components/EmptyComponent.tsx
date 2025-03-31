import React from 'react';

import {Image, View, Text, StyleSheet} from 'react-native';
import {useTheme} from 'react-native-paper';
import NODATA_IMAGE from './../Assets/Images/wallet.png';
const EmptyComponent = ({
  containerStyle,
  height = 100,
  width = 100,
  text = 'No Data',
  button,
}) => {
  const theme = useTheme();
  const primaryColor = theme.colors.primary;
  return (
    <View style={[styles.container, containerStyle]}>
      <Image style={{width, height}} source={NODATA_IMAGE} />
      <Text style={styles.text}>{text}</Text>
      {Boolean(button) && button}
    </View>
  );
};

export default EmptyComponent;

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  text: {
    fontSize: 18,
    fontFamily: 'AvenirArabic-Heavy',
    // fontWeight: 'bold',
    marginVertical: 15,
    color: '#222',
  },
});
