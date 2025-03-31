import React, {useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  FlatList,
  TouchableOpacityBase,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import {Avatar} from 'react-native-paper';
import CustomButton from '../CustomButton';
import Header from '../Header';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import faker from 'faker';
import GenericCard from './../Cards/GenericCard';
import Searchbar from './../Inputs/SearchBar';
import {createFilter} from './../../Utils/createFilter';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {Checkbox, useTheme, Divider} from 'react-native-paper';
import {EmptyComponent} from '..';
const GlobalListModal = ({
  open,
  setOpen,
  onSelect,
  data,
  keysToFilter,
  inputPlaceHolder,
  identifier,
  value,
  isMultiple,
  handleMultipleSelect,
  CustomCard,
}) => {
  const theme = useTheme();

  const primaryColor = theme.colors.primary;
  const [searchTerm, setSearchTerm] = useState('');
  const filterData = data?.filter(createFilter(searchTerm, keysToFilter));

  // console.log(value, 'DATA');
  return (
    <Modal
      isVisible={open}
      backdropOpacity={1}
      backdropColor="#fff"
      style={{
        padding: 0,
        margin: 0,
        marginTop: Platform.OS === 'ios' ? getStatusBarHeight() : 0,
      }}
      onBackButtonPress={() => setOpen(false)}
      animationIn="bounceInRight"
      animationOut="bounceOutLeft"
      animationInTiming={700}>
      <Header onBackBtn={() => setOpen(false)} iconRight="close" />
      <Searchbar
        placeholder={inputPlaceHolder || 'Search items'}
        value={searchTerm}
        setValue={setSearchTerm}
      />
      <View style={styles.contentContainer}>
        <FlatList
          data={filterData}
          contentContainerStyle={{
            paddingHorizontal: 0,
            paddingVertical: 10,
            flexGrow: 1,
          }}
          renderItem={({item}) => {
            const selected = isMultiple
              ? value?.[item?.[identifier]]
              : item?.[identifier] === value?.[identifier];
            return (
              <>
                <TouchableOpacity
                  onPress={
                    isMultiple
                      ? () => handleMultipleSelect(item, selected, 'internal')
                      : () => {
                        onSelect(item);
                        setOpen(false);
                      }
                  }
                  style={styles.touch}>
                  {CustomCard ? (
                    <CustomCard data={item} disabled selected={selected} />
                  ) : (
                    <GenericCard data={item} selected={selected} />
                  )}
                </TouchableOpacity>
                <Divider />
              </>
            );
          }}
          ListEmptyComponent={() => <EmptyComponent />}
          keyExtractor={key => key[identifier]}
        />
      </View>
    </Modal>
  );
};
export default GlobalListModal;

const styles = StyleSheet.create({
  date: {
    color: '#666666',
    fontSize: 12,
  },
  description: {
    color: '#666666',
    lineHeight: 20,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewCard: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingRight: 10,
  },
  userName: {
    fontWeight: 'bold',
  },
  avatarCont: {
    paddingHorizontal: 5,
  },
  reviewContent: {
    padding: 5,
    maxWidth: 300,
    flex: 1,
    // paddingHorizontal: 20,
  },
  addBtnConatainer: {
    flex: 1,
    paddingRight: 40,
  },
  ratingContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
  },
  ratingText: {
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  midContainer: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    padding: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  mainHeading: {
    fontSize: 35,
  },
  subHeading: {
    color: '#A2A2A2',
  },
  touch: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
