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
import {
  GenericCard,
  SearchBar,
  Header,
  EmptyComponent,
  CustomButton,
} from './../Components';
import {createFilter} from './../Utils/createFilter';
import {Checkbox, useTheme, Divider} from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '../Redux/hooks';
import {useNavigation} from '@react-navigation/native';
import {SET_SUBJECT} from '../Redux/Types';
import {ADD_SUBJECT_PATH} from '../Navigation/Routes';
const GlobalListModal = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const subjects = useAppSelector(state => state.subjectReducer.subjects);

  const navigation = useNavigation();
  const primaryColor = theme.colors.primary;
  const [searchTerm, setSearchTerm] = useState('');
  const filterData = subjects?.filter(createFilter(searchTerm, ['title']));
  const selected = useAppSelector(state => state?.metaReducer?.selectedSubject);
  // console.log(value, 'DATA');
  const onSelect = item => {
    dispatch({
      type: SET_SUBJECT,
      payload: item,
    });

    navigation.goBack();
  };
  const identifier = '_id';
  return (
    <View style={styles.container}>
      <Header />
      <SearchBar
        placeholder={'Search Categories'}
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
            const selected1 = item?.[identifier] === selected?.[identifier];
            return (
              <>
                <TouchableOpacity
                  onPress={() => onSelect(item)}
                  style={styles.touch}>
                  <GenericCard data={item} selected={selected1} />
                </TouchableOpacity>
                <Divider />
              </>
            );
          }}
          ListEmptyComponent={() => (
            <EmptyComponent
              text="No Categories Found"
              button={
                <CustomButton
                  onPress={() => navigation.navigate(ADD_SUBJECT_PATH)}>
                  Add Category
                </CustomButton>
              }
            />
          )}
          keyExtractor={key => key[identifier]}
        />
      </View>
    </View>
  );
};
export default GlobalListModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
