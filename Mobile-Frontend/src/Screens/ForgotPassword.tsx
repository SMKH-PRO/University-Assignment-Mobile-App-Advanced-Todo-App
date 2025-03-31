import React, {useState, useEffect, useRef} from 'react';

import {Text} from 'react-native-paper';

import {
  StyleSheet,
  ImageBackground,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import BACKGROUND_IMAGE from './../Assets/Images/login-background.png';
import {LoginInput, CustomButton, Toast} from './../Components';

import {useNavigation} from '@react-navigation/native';
import {
  FORGOT_PASSWORD_API,
  COMFIRM_CODE,
  RESET_PASSWORD,
} from '../Constants';
import {validateEmail} from '../Utils/globalFuntions';
import axios from '../Utils/axios';
import {useDispatch} from 'react-redux';
import DropdownAlert, { DropdownAlertData, DropdownAlertType } from 'react-native-dropdownalert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LOGIN_PATH} from '../Navigation/Routes';
const ForgotPassword = () => {
  const navigation = useNavigation();
  let alert = (data?: DropdownAlertData) => new Promise<DropdownAlertData>(res => res(data || {}));
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [reset, setReset] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const [fpId, setFPId] = useState(null);
  const handleLogin = async () => {
    try {
      if (!email) {
        throw new Error('Email is required');
      }
      if (!validateEmail(email)) {
        throw new Error('Email is not valid');
      }

      setLoading(true);

      const req = await axios({
        url: FORGOT_PASSWORD_API,
        data: {email},
        method: 'POST',
      });
      //   setUserToken(req?.data?.token);
      //   dispatch({
      //     type: ADD_USER,
      //     payload: req.data,
      //   });

      setCodeSent(true);
      setFPId(req.data.fpId);
      await alert({
        type: DropdownAlertType.Success,
        title: 'Success',
        message: req.data?.message || 'Code sent successfully',
      });
      setLoading(false);
    } catch (error: any) {
      console.log(error, 'ERROR');
      setLoading(false);
      await alert({
        type: DropdownAlertType.Error,
        title: 'Error',
        message: error?.message || 'An error occurred',
      });
    }
  };

  const handleConfirm = async () => {
    console.log(COMFIRM_CODE, 'COMFIRM_CODE');
    try {
      if (!fpId) {
        throw new Error('Something went wrong try again later');
      }
      if (!code) {
        throw new Error('Code is not valid');
      }

      setLoading(true);

      const req = await axios({
        url: COMFIRM_CODE,
        data: {fpId, code},
        method: 'POST',
      });
      //   setUserToken(req?.data?.token);
      //   dispatch({
      //     type: ADD_USER,
      //     payload: req.data,
      //   });

      console.log(req.data, 'DATATATATTA');
      setUserToken(req.data);
      setCodeSent(true);
      setReset(true);
      await alert({
        type: DropdownAlertType.Success,
        title: 'Success',
        message: req.data?.message || 'Code confirmed successfully',
      });
      setLoading(false);
    } catch (error: any) {
      console.log(error, 'ERROR');
      setLoading(false);
      await alert({
        type: DropdownAlertType.Error,
        title: 'Error',
        message: error?.message || 'An error occurred',
      });
    }
  };

  const setUserToken = async token => {
    await AsyncStorage.setItem('@token', token);
  };

  const handleReset = async () => {
    console.log(COMFIRM_CODE, 'COMFIRM_CODE');
    try {
      if (!password) {
        throw new Error('Password is required');
      }
      if (password.length <= 5) {
        throw new Error('Passwords length should at least be 6 digits');
      }
      if (confirmPassword !== password) {
        throw new Error('Passwords do not match');
      }

      setLoading(true);

      const req = await axios({
        url: RESET_PASSWORD,
        data: {password, confirmPassword},
        method: 'POST',
      });

      console.log(req.data, 'DATATATATTA');
      AsyncStorage.removeItem('@token');
      setCodeSent(false);
      setReset(false);
      await alert({
        type: DropdownAlertType.Success,
        title: 'Success',
        message: 'Password reset successfully',
      });
      setTimeout(() => {
        setLoading(false);
        navigation.goBack();

      }, 1000);

    } catch (error: any) {
      console.log(error, 'ERROR');
      setLoading(false);
      await alert({
        type: DropdownAlertType.Error,
        title: 'Error',
        message: error?.message || 'An error occurred',
      });
    }
  };

  return (
    <ImageBackground source={BACKGROUND_IMAGE} style={styles.container}>
      <View style={styles.backdrop}>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Forgot Password</Text>
          </View>
          <View style={styles.flex1}>
            {reset ? (
              <>
                <View style={styles.inputs}>
                  <LoginInput
                    value={password}
                    onChange={setPassword}
                    label="Password"
                    secureTextEntry={true}
                  />

                  <LoginInput
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    label="Confirm Password"
                    secureTextEntry={true}
                  />
                </View>
                <View style={styles.btnContainer}>
                  <CustomButton
                    loading={loading}
                    disabled={loading}
                    mode="contained"
                    onPress={handleReset}>
                    Reset Password
                  </CustomButton>
                </View>
              </>
            ) : codeSent ? (
              <>
                <View style={styles.inputs}>
                  <LoginInput value={code} onChange={setCode} label="code" />
                </View>

                <View style={styles.btnContainer}>
                  <CustomButton
                    loading={loading}
                    disabled={loading}
                    mode="contained"
                    onPress={handleConfirm}>
                    confirm code
                  </CustomButton>
                </View>
              </>
            ) : (
              <>
                <View style={styles.inputs}>
                  <LoginInput
                    value={email}
                    onChange={setEmail}
                    label="Email"
                    style={{marginBottom: 8}}
                  />
                </View>
                <View style={styles.btnContainer}>
                  <CustomButton
                    loading={loading}
                    disabled={loading}
                    mode="contained"
                    onPress={handleLogin}>
                    Send Code
                  </CustomButton>
                </View>
              </>
            )}
            <View style={styles.center}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                disabled={loading}>
                <Text style={[styles.centerText, {color: '#ffcd47'}]}>
                  Go Back
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
      <DropdownAlert alert={func => (alert = func)} />
    </ImageBackground>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  header: {
    marginTop: 60,
    marginBottom: 10,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'AvenirArabic-Heavy',
  },
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  inputs: {
    padding: 20,
  },
  btnContainer: {
    paddingHorizontal: 25,
  },
  center: {
    marginTop: 20,
  },

  centerText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#fff',
    padding: 3,
  },
  socialContainer: {
    justifyContent: 'flex-end',
  },
  socailBtnContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  socailBtn: {
    // alignItems: 'flex-start',
    // padding: 8,
    borderRadius: 10,
  },
});
