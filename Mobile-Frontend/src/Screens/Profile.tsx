import React, {
  useState,
  useEffect,
  createRef,
  useRef,
  useCallback,
} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {Text, IconButton, useTheme} from 'react-native-paper';
import {Header, CustomButton, Toast} from './../Components';
import USER_IMAGE from './../Assets/Images/user.png';
import {LoginInput} from './../Components';
import {useSelector, useDispatch} from 'react-redux';
import {EDIT_PROFILE, UPLOAD_IMAGE} from '../Constants';
import axios from './../Utils/axios';
import {ADD_USER} from './../Redux/Types';
import ActionSheet from 'react-native-actions-sheet';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import DropdownAlert, { DropdownAlertData, DropdownAlertType } from 'react-native-dropdownalert';
import {useFocusEffect} from '@react-navigation/native';
const actionSheetRef = createRef();

const options = {
  saveToPhotos: true,
  mediaType: 'photo',
  includeBase64: false,
};

const Profile = () => {
  let actionSheet;
  let alert = (data?: DropdownAlertData) => new Promise<DropdownAlertData>(res => res(data || {}));
  const theme = useTheme();
  const dispatch = useDispatch();
  const primaryColor = theme.colors.primary;
  const user = useSelector(state => state?.userReducer?.user);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const actionList = [
    {
      title: 'Launch Camera',
      onPress: () => handleCamera(),
    },
    {
      title: 'Launch Image Library',
      onPress: () => handleLibrary(),
    },
  ];
  useFocusEffect(
    useCallback(() => {
      setFirstName(user?.firstName);
      setLastName(user?.lastName);
      setImage(user?.imageUrl);
    }, [user]),
  );

  const handleCamera = async () => {
    actionSheetRef.current?.hide();
    setTimeout(() => {
      launchCamera(
      options,
      data => {
        if (data.didCancel) {
          return;
        }
        console.log(data);
        setImage(data?.assets?.[0]);
      },
      err => {
        console.log(err);
      },
    );
  }, 500);
};
  const handleLibrary = async () => {
    actionSheetRef.current?.hide();
    setTimeout(() => {
      launchImageLibrary(
        options,
        data => {
          console.log(data);
          if (data.didCancel) {
            return;
          }
          setImage(data?.assets?.[0]);
        },
        err => {
          console.log(err);
        },
      );
    }, 500);
  };

  const createFormData = photo => {
    const data = new FormData();
    const uriParts = photo.uri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    data.append('image', {
      name: 'profilePic',
      type: `image/${fileType}`,
      uri: Platform.OS === 'ios' ? photo.uri.replace('file://', '') : photo.uri,
    });

    return data;
  };

  const handleEdit = async () => {
    try {
      setLoading(true);
      const imageUri = image?.uri;
      // console.log(imageUri, 'imageUri');
      let imageUrl;
      if (imageUri) {
        const formData = new FormData();
        formData.append('directory', 'profile');
        // formData.append('image', {
        //   uri: imageUri,
        //   name: image.name,
        //   type: image.type,
        // });
        const uriParts = image?.uri?.split('.');
        const fileType = uriParts?.[uriParts?.length - 1];
        formData.append('image', {
          name: 'profilePic',
          type: `image/${fileType}`,
          uri:
            Platform.OS === 'ios'
              ? image.uri.replace('file://', '')
              : image.uri,
        });

        console.log(UPLOAD_IMAGE, formData);
        const imgReq = await fetch(UPLOAD_IMAGE, {
          body: formData,
          method: 'POST',
          headers: {
            Accept: 'application/json',

            'Content-Type': 'multipart/form-data; charset=utf-8',
          },
        });

        const imageJson = await imgReq.json();

        imageUrl = imageJson?.secure_url;
      }
      console.log(imageUrl, 'imageUrl', {
        firstName,
        lastName,
        imageUrl: imageUrl ? imageUrl : user.imageUrl,
      });

      const req = await axios({
        url: EDIT_PROFILE,
        method: 'POST',
        data: {
          firstName,
          lastName,
          imageUrl: imageUrl ? imageUrl : user.imageUrl,
        },
      });
      dispatch({type: ADD_USER, payload: req.data});
      setLoading(false);
      await alert({
        type: DropdownAlertType.Success,
        title: 'Success',
        message: 'Profile Edited Successfully',
      });
    } catch (err: any) {
      console.log(err);
      setLoading(false);
      await alert({
        type: DropdownAlertType.Error,
        title: 'Error',
        message: err?.message || 'An error occurred',
      });
    }
  };
  // console.log(image ? (image?.uri ? image : {uri: image}) : USER_IMAGE);
  return (
    <View style={styles.container}>
      <Header title="" elevation={0} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.container}>
          <Text style={styles.header}>Profile</Text>
          <View style={styles.imageContainer}>
            <Image
              source={image ? (image?.uri ? image : {uri: image}) : USER_IMAGE}
              style={styles.image}
            />
            <IconButton
              size={16}
              style={[styles.editBtn, {backgroundColor: primaryColor}]}
              icon="pencil"
              color="#fff"
              onPress={() => {
                actionSheetRef.current?.show();
              }}
            />
          </View>
          <View style={styles.input}>
            <LoginInput
              value={firstName}
              onChange={setFirstName}
              label="First Name"
              style={{marginBottom: 8}}
            />
            <LoginInput
              value={lastName}
              onChange={setLastName}
              label="Last Name"
              style={{marginBottom: 8}}
            />
            <View style={{marginTop: 5, paddingHorizontal: 5}}>
              <CustomButton
                loading={loading}
                disabled={loading}
                onPress={handleEdit}>
                Edit Profile
              </CustomButton>
            </View>
          </View>
        </View>
        <ActionSheet ref={actionSheetRef}>
          <View style={styles.action}>
            {actionList.map((item, index) => {
              return (
                <View key={index} style={styles.actionCont}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => item.onPress()}>
                    <Text style={styles.actionText}>{item.title}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
            <View style={[styles.actionCont, {marginTop: 20}]}>
              <TouchableOpacity
                onPress={() => actionSheetRef.current?.hide()}
                style={[styles.actionBtn, {backgroundColor: '#de5246'}]}>
                <Text style={[styles.actionText, {color: 'white'}]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ActionSheet>
      </ScrollView>
      <DropdownAlert alert={func => (alert = func)} />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
  },
  header: {
    padding: 10,
    fontSize: 24,
    marginVertical: 25,
    fontFamily: 'AvenirArabic-Heavy',
    textAlign: 'center',
  },
  image: {
    height: 120,
    width: 120,
    // resizeMode: 'contain',
    borderRadius: 100,
  },
  imageContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    height: 130,
    width: 130,
    // backgroundColor: '#f0f0f0',
    borderRadius: 100,
  },
  editBtn: {
    marginTop: -30,
    marginRight: -80,
  },
  input: {padding: 15},
  action: {
    padding: 20,
  },
  actionCont: {
    marginVertical: 3,
  },
  actionBtn: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 20,
  },
});
