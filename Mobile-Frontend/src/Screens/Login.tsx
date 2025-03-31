import React, {useState, useEffect, useRef} from 'react';

import {Text} from 'react-native-paper';

import {
  StyleSheet,
  ImageBackground,
  View,
  TouchableOpacity,
  ScrollView,
  BackHandler,
} from 'react-native';
import BACKGROUND_IMAGE from './../Assets/Images/login-background.png';
import {LoginInput, CustomButton, Toast} from './../Components';

import {useNavigation} from '@react-navigation/native';
import {FORGOT_PASSWORD_PATH, HOME_PATH} from '../Navigation/Routes';
import {SIGNUP_API, SIGHIN_API} from '../Constants';
import {validateEmail} from '../Utils/globalFuntions';
import axios from '../Utils/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
import {ADD_USER} from './../Redux/Types';
import DropdownAlert, { DropdownAlertData, DropdownAlertType } from 'react-native-dropdownalert';

const Login = () => {
  const navigation = useNavigation();
  let alert = (data?: DropdownAlertData) => new Promise<DropdownAlertData>(res => res(data || {}));
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignin, setIsSignin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [socialType, setSocialType] = useState('');
  
  const handleLogin = async () => {
    try {
      if (!email) {
        throw new Error('Email is required');
      }
      if (!validateEmail(email)) {
        throw new Error('Email is not valid');
      }

      if (!password) {
        throw new Error('Password is required');
      }
      setLoading(true);
      setSocialType('email');
      
      const req = await axios({
        url: SIGHIN_API,
        data: {email, password},
        method: 'POST',
      });
      setUserToken(req?.data?.token);
      dispatch({
        type: ADD_USER,
        payload: req.data,
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

  const handleSignup = async () => {
    try {
      
      setLoading(true);
      setSocialType('email');
      
      console.log(SIGNUP_API, 'lasj');
      const req = await axios({
        url: SIGNUP_API,
        data: {email, firstName, lastName, password},
        method: 'POST',
      });
      setUserToken(req?.data?.token);
      dispatch({
        type: ADD_USER,
        payload: req.data,
      });
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      await alert({
        type: DropdownAlertType.Error,
        title: 'Error',
        message: error?.message || 'An error occurred',
      });
    }
  };

  useEffect(() => {
    const backAction = () => {
      console.log(isSignin, 'isSignin');
      if (isSignin) {
        console.log(1, 'isSignin');
        BackHandler.exitApp();
      } else {
        console.log(2, 'isSignin');
        setIsSignin(true);
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [isSignin]);

  useEffect(() => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setLoading(false);
  }, [isSignin]);

  const setUserToken = async token => {
    await AsyncStorage.setItem('@token', token);
  };

  return (
    <ImageBackground source={BACKGROUND_IMAGE} style={styles.container}>
    <View style={styles.backdrop}>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Sign In</Text>
        </View>
        <View style={styles.flex1}>
          <View style={styles.inputs}>
            {!isSignin && (
              <>
                <LoginInput
                  value={firstName}
                  onChange={setFirstName}
                  label="First Name"
                />
                <LoginInput
                  value={lastName}
                  onChange={setLastName}
                  label="Last Name"
                />
              </>
            )}
            <LoginInput 
              value={email} 
              onChange={setEmail}
              label="Email" 
            />

            <LoginInput
              value={password}
              onChange={setPassword}
              label="Password"
              secureTextEntry={true}
            />
            {!isSignin && (
              <LoginInput
                value={confirmPassword}
                onChange={setConfirmPassword}
                label="Confirm Password"
                secureTextEntry={true}
              />
            )}
          </View>
          <View style={styles.btnContainer}>
            <CustomButton
              loading={loading && socialType === 'email'}
              disabled={loading}
              mode="contained"
              onPress={isSignin ? handleLogin : handleSignup}>
              {isSignin ? 'Login Now' : 'Sign up'}
            </CustomButton>

            {isSignin && (
              <TouchableOpacity
                disabled={loading}
                onPress={() => navigation.navigate(FORGOT_PASSWORD_PATH)}>
                <Text style={styles.forgot}>Forgot Password?</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.center}>
            <Text style={styles.centerText}>
              {isSignin
                ? "Don't have an account?"
                : 'Already have an account?'}
            </Text>
            <TouchableOpacity
              onPress={() => setIsSignin(!isSignin)}
              disabled={loading}>
              <Text style={[styles.centerText, {color: '#ffcd47'}]}>
                {!isSignin ? 'Sign in' : 'Sign up Now'}
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

export default Login;

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
    paddingHorizontal: 25,
    paddingVertical: 8,
  },
  socailBtn: {
    borderRadius: 10,
  },
  forgot: {
    textAlign: 'right',
    color: '#ffcd47',
    margin: 2,
    fontSize: 16,
    fontFamily: 'AvenirArabic-Light',
  },
});
