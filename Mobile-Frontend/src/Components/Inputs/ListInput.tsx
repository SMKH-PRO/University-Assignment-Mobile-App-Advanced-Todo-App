import React, {useState} from 'react';
import {IconButton, Text, TextInput, useTheme} from 'react-native-paper';

import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Modal from 'react-native-modal';
import GlobalListModal from './../Modals/GlobalListModal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import TouchableInput from './TouchableInput';
const ListInput = ({
  value,
  style,
  onPress,
  placeholder,
  onClose,
  onSelect,
  data,
  keysToFilter = ['title'],
  inputPlaceHolder,
  identifier = '_id',
  isMultiple = false,
  CustomCard,
  label,
}) => {
  const theme = useTheme();
  const primaryColor = theme.colors.primary;

  const [modalVisible, setModalVisible] = useState(false);

  const multipleValues = isMultiple
    ? Object.keys(value || {}).filter(v => value[v])
    : null;

  const handleMultipleSelect = (item, selected, internal) => {
    console.log(item, selected, internal, identifier);
    if (internal) {
      onSelect({
        ...value,
        [item[identifier]]: selected ? null : item,
      });
    } else {
      let currentValue = value || {};

      if (currentValue[item?.[identifier]]) {
        delete currentValue[item?.[identifier]];
      } else {
        currentValue = {
          ...value,
          [item[identifier]]: item,
        };
      }

      onSelect({...currentValue});
    }
  };
  return (
    <>
      {/* {Boolean(value?.['title']) && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[style, styles.container]}
        onPress={() => setModalVisible(true)}>
        <Text
          style={[
            styles.text,
            !isMultiple && Boolean(value) && {color: '#222'},
          ]}>
          {!isMultiple && value ? value['title'] : placeholder}
        </Text>
        {isMultiple && <MaterialCommunityIcons name="chevron-down" size={20} />}
      </TouchableOpacity> */}
      <TouchableInput
        onPress={() => setModalVisible(true)}
        value={!isMultiple && value ? value.title : placeholder}
        label={label}
      />
      {Boolean(multipleValues?.length) && (
        <View style={styles.selectedContainer}>
          {multipleValues.map(item => {
            const data = value[item];
            return (
              <View style={styles.selectedItem} key={data?.[identifier]}>
                <Text style={styles.text}>{data?.title}</Text>
                <IconButton
                  icon="close"
                  size={16}
                  style={styles.iconButton}
                  onPress={() => handleMultipleSelect(data)}
                />
              </View>
            );
          })}
        </View>
      )}
      <GlobalListModal
        open={modalVisible}
        setOpen={setModalVisible}
        onSelect={onSelect}
        onClose={onClose}
        data={data}
        keysToFilter={keysToFilter}
        inputPlaceHolder={inputPlaceHolder}
        identifier={identifier}
        value={value}
        isMultiple={isMultiple}
        handleMultipleSelect={handleMultipleSelect}
        CustomCard={CustomCard}
      />
    </>
  );
};

export default ListInput;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    zIndex: 4,
    padding: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    fontSize: 15,
    color: '#707070',
  },
  selectedContainer: {
    marginTop: 5,
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  selectedItem: {
    paddingLeft: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
    borderColor: '#E5E8EB',
    borderWidth: 1,
    borderRadius: 25,
  },
  iconButton: {
    backgroundColor: '#DDDDDD',
  },
  label: {
    fontSize: 12,

    color: '#717171',
    marginBottom: -15,
    zIndex: 10,
    marginLeft: 12,
  },
});
