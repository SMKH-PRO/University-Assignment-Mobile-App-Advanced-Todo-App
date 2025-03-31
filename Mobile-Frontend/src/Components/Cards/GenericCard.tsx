import React from 'react';

import {Text, useTheme, Divider, Checkbox } from 'react-native-paper';

import {View, StyleSheet, TouchableOpacity} from 'react-native';

const GenericCard = ({data, selected}) => {
  const theme = useTheme();

  const primaryColor = theme.colors.primary;
  const {title, subtitle} = data;
  return (
    <>
      <View style={styles.container}>
        <View style={styles.titleCont}>
          {Boolean(selected) && (
            <Checkbox status={'checked'} color={primaryColor} />
          )}
          <Text style={styles.title}  numberOfLines={1}>{title}</Text>
        </View>
        {Boolean(subtitle) && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </>
  );
};

export default GenericCard;

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    marginHorizontal: 20,
    padding: 10,
    // backgroundColor: 'pink',
  },
  title: {
    fontSize: 20,
    fontFamily: 'AvenirArabic-Heavy',

  },
  subtitle: {
    fontSize: 13,
    marginTop: 3,
    color: '#959595',
  },
  titleCont: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
