import React, {useState, useEffect, useRef} from 'react';

import {Text, useTheme, IconButton, TextInput} from 'react-native-paper';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Touchable,
  TouchableOpacityBase,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import {Header, CustomButton, LoginInput, Toast} from './../Components';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  CREATE_SUBJECTS,
  GET_SUBJECTS,
  UPLOAD_IMAGE,
  CHECK_SUBJECTS,
  CHECK_SUBJECT,
  EDIT_SUBJECT,
} from '../Constants';
import axios from './../Utils/axios';
import {ADD_SUBJECT} from '../Redux/Types';
import {useDispatch, useSelector} from 'react-redux';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import EMPTY_SUBJECT_IMAGE from './../Assets/Images/empty-subject.png';
import DropdownAlert, { DropdownAlertData, DropdownAlertType } from 'react-native-dropdownalert';
import {image} from 'faker';
import {getStatusBarHeight} from 'react-native-status-bar-height';

const options = {
  saveToPhotos: true,
  mediaType: 'photo',
  includeBase64: false,
};
const AddSubject = ({route, navigation}) => {
  const subjectId = route?.params?.subjectId;
  let alert = (data?: DropdownAlertData) => new Promise<DropdownAlertData>(res => res(data || {}));
  const theme = useTheme();
  const dispatch = useDispatch();
  const subjectsRedux = useSelector(
    state => state.subjectReducer.subjects || [],
  );
  const subjectDetails = useSelector(state =>
    state.subjectReducer.subjects.find(v => v._id === subjectId),
  );
  const primaryColor = theme.colors.primary;
  const iconColor = theme.colors.icon;
  const [loading, setLoading] = useState(true);
  const [isEdit, setEdit] = useState(false);
  const [subjects, setSubjects] = useState([
    {title: '', image: null},
    {title: '', image: null},
    {title: '', image: null},
  ]);

  const getSubjects = async () => {
    try {
      const req = await axios({
        url: GET_SUBJECTS,

        method: 'GET',
      });
      dispatch({type: ADD_SUBJECT, payload: req.data});
    } catch (error: any) {
      Toast(error.message);
    }
  };

  useEffect(() => {
    if (subjectId) {
      setEdit(true);
      setSubjects([
        {
          title: subjectDetails.title,
          image: subjectDetails.image,
        },
      ]);
    }
    if (subjects) {
      setLoading(false);
    }
    getSubjects;
  }, []);

  const handleChange = (text, index) => {
    const localSubjects = [...subjects];
    console.log(localSubjects[index], 'ocalSubjects[index]');
    localSubjects[index].title = text;
    console.log(text, index, localSubjects[index].title);

    setSubjects(localSubjects);
  };

  const handleSubjectAddition = () => {
    setSubjects([...subjects, '']);
  };

  const handleSubmit = async () => {
    try {
      const filterSubjects = subjects.filter(v => v?.title?.length);
      if (!filterSubjects.length) {
        throw new Error('Add one subjects is required');
      }
      setLoading(true);

      const req = await axios({
        url: CHECK_SUBJECTS,
        data: {subjects: filterSubjects.map(v => v.title)},
        method: 'POST',
      });

      if (req.success) {
        // console.log('OK', filterSubjects);
        const afterImageArr = [];
        for (const data of filterSubjects) {
          const image = data.image;
          let imageUrl = null;

          console.log(image, data.title, data);
          if (image) {
            imageUrl = await uploadImage(image);
          }

          afterImageArr.push({title: data.title, image: imageUrl});
        }

        const req = await axios({
          url: CREATE_SUBJECTS,
          data: {subjects: afterImageArr},
          method: 'POST',
        });

        dispatch({type: ADD_SUBJECT, payload: [...subjectsRedux, ...req.data]});
        setLoading(false);
        setSubjects([
          {title: '', image: null},
          {title: '', image: null},
          {title: '', image: null},
        ]);
        await alert({
          type: DropdownAlertType.Success,
          title: 'Success',
          message: 'Subjects added successfully',
        });
      }

      console.log('SUCCESS', req);
    } catch (error: any) {
      setLoading(false);
      await alert({
        type: DropdownAlertType.Error,
        title: 'Error',
        message: error?.message || 'An error occurred',
      });
    }
  };

  const handleimage = index => {
    launchImageLibrary(options, data => {
      if (data.didCancel) {
        return;
      }
      const localSubjects = [...subjects];

      localSubjects[index].image = data.assets[0];

      setSubjects(localSubjects);
    });
  };

  const uploadImage = async image => {
    try {
      const formData = new FormData();
      formData.append('directory', 'subject');
      const uriParts = image?.uri?.split('.');
      const fileType = uriParts?.[uriParts?.length - 1];
      formData.append('image', {
        name: 'profilePic',
        type: `image/${fileType}`,
        uri:
          Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
      });

      console.log('UPLOAD_IMAGE');
      const imgReq = await fetch(UPLOAD_IMAGE, {
        body: formData,
        method: 'POST',
        headers: {
          Accept: 'application/json',

          'Content-Type': 'multipart/form-data; charset=utf-8',
        },
      });

      const imageJson = await imgReq.json();

      return imageJson?.secure_url;
    } catch (err: any) {
      setLoading(false);
      await alert({
        type: DropdownAlertType.Error,
        title: 'Error',
        message: err?.message || 'An error occurred',
      });
    }
  };
  const handleDelete = index => {
    const localSubjects = [...subjects];

    localSubjects.splice(index, 1);
    setSubjects(localSubjects);
  };

  const handleEdit = async () => {
    try {
      const reqObj = {
        title: subjects[0]?.title,
        image: subjects[0]?.image,
        subjectId,
      };

      if (!reqObj.title) {
        throw new Error('Subject Name is required');
      }
      setLoading(true);
      if (reqObj?.image?.uri) {
        reqObj.image = await uploadImage(reqObj?.image);
      }
      const req = await axios({
        url: CHECK_SUBJECT,
        data: reqObj,
        method: 'POST',
      });

      const reqEdit = await axios({
        url: EDIT_SUBJECT,
        data: reqObj,
        method: 'POST',
      });
      console.log(req.data, 'EDDITED DATA');

      const subjectsEdited = [...(subjectsRedux || [])];

      const subjectIndex = subjectsEdited.findIndex(v => v._id == subjectId);
      const subjectFind = subjectsEdited.find(v => v._id == subjectId);
      subjectsEdited[subjectIndex] = reqEdit.data;
      dispatch({type: ADD_SUBJECT, payload: subjectsEdited});
      await alert({
        type: DropdownAlertType.Success,
        title: 'Success',
        message: 'Subjects edited successfully',
      });

      setTimeout(() => {
        navigation.goBack();
        setLoading(false);
      }, 1000);
      console.log('DON');
    } catch (error: any) {
      setLoading(false);
      await alert({
        type: DropdownAlertType.Error,
        title: 'Error',
        message: error?.message || 'An error occurred',
      });
    }
  };

  // console.log(subjectsRedux, 'subjectsRedux');
  return (
    <View style={styles.container}>
      <Header elevation={0} iconRight="close" />
      <KeyboardAvoidingView
        style={{flex: 1}}
        keyboardVerticalOffset={getStatusBarHeight()}
        behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.content}>
            <View style={styles.container}>
              <Text style={styles.header}>
                {isEdit ? 'Edit' : 'Add'} Categories
              </Text>

              {subjects.map((value, index) => {
                // console.log(value);
                return (
                  <View style={styles.inputContainer} key={index}>
                    <TouchableOpacity
                      onPress={() => handleimage(index)}
                      style={{
                        paddingHorizontal: 9,
                        borderRadius: 5,
                        // backgroundColor: 'pink',
                        marginTop: 5,
                        // height: '100%'
                      }}>
                      <Image
                        source={
                          value.image
                            ? value.image
                            : EMPTY_SUBJECT_IMAGE
                        }
                        style={styles.image}
                      />
                      <View
                        style={{
                          width: 17,
                          height: 17,
                          backgroundColor: primaryColor,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 10,
                          marginTop: -17,
                          marginLeft: 45,
                        }}>
                        <MaterialCommunityIcons name="plus" color="#fff" />
                      </View>
                    </TouchableOpacity>
                    <View style={{flex: 1}}>
                      <LoginInput
                        value={value.title}
                        label="Category"
                        onChange={text => handleChange(text, index)}
                        right={
                          subjects.length > 1 && (
                            <MaterialCommunityIcons
                              name="close"
                              onPress={() => handleDelete(index)}
                              color={iconColor}
                              size={22}
                            />
                          )
                        }
                      />
                    </View>
                  </View>
                );
              })}
              {!isEdit && (
                <View style={styles.addMoreContainer}>
                  <TouchableOpacity
                    style={[styles.addMore, {borderBottomColor: primaryColor}]}
                    onPress={handleSubjectAddition}>
                    <MaterialCommunityIcons
                      name="plus"
                      size={15}
                      color={primaryColor}
                    />
                    <Text style={[styles.addMoreText, {color: primaryColor}]}>
                      Add More Categories
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View>
              {isEdit ? (
                <CustomButton
                  onPress={handleEdit}
                  loading={loading}
                  disabled={loading}>
                  Edit Category
                </CustomButton>
              ) : (
                <CustomButton
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading}>
                  Save Categories
                </CustomButton>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <DropdownAlert alert={func => (alert = func)} />
    </View>
  );
};

export default AddSubject;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scroll: {
    flexGrow: 1,
  },
  header: {
    padding: 10,
    fontSize: 24,
    marginBottom: 50,
    fontFamily: 'AvenirArabic-Heavy',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  addMore: {
    paddingTop: 10,
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  addMoreText: {
    fontSize: 14,
  },
  image: {
    height: 55,
    width: 55,
    resizeMode: 'cover',
    borderRadius: 5,
  },
});
