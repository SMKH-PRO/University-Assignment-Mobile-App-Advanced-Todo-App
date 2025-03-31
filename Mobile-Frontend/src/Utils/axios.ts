import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const getHeadersAndToken = async () => {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
  };
  const token = await AsyncStorage.getItem('@token');
  // console.log(token, 'token');
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  return { token, headers };
};

const handleMongooseError = response => {
  let returnResponse = {};
  if (response.name === 'ValidationError') {
    const errorsArray = [];

    for (const item in response.errors) {
      if (response.errors.hasOwnProperty(item)) {
        errorsArray.push(response.errors[`${item}`].message);
      }
    }

    returnResponse.message = errorsArray[0];
  } else if (typeof response === 'object' && 'message' in response) {
    returnResponse = { message: response.message };
  } else if (Array.isArray(response)) {
    returnResponse.message = response[0];
  } else if (typeof response === 'string') {
    returnResponse.message = response;
  }

  return returnResponse;
};

const request = async optionss => {
  // console.log(optionss, 'optionss');
  const tokenAndHeaders = await getHeadersAndToken();
  const authorization = tokenAndHeaders?.headers?.authorization;

  const headers = {
    ...(optionss?.headers ? optionss.headers : {}),
    authorization,
  };

  const options = {
    ...(optionss ? optionss : {}),
    headers,
  };

  //   console.log('post', authorization);

  return new Promise((resolve, reject) => {
    console.log(options, 'options');
    axios(options)
      .then(response => {
        console.log('RESPONSE', response.data, response.message);
        resolve(response?.data);
      })
      .catch(async e => {

        const errorMessage = handleMongooseError(e?.response?.data || e);
        const errorNetworkLocal = await AsyncStorage.getItem('@network-error');
        console.log('ERR RESPONSE', errorMessage);

        if (errorMessage?.message == 'Network Error') {
          await AsyncStorage.setItem('@network-error', 'true');
        } else {
          await AsyncStorage.removeItem('@network-error');
        }

        if (errorNetworkLocal) {
          // reject("")
        } else {
          reject(errorMessage);
        }

        // console.log(errorMessage.message, 'errorMessage');
      });
  });
};

export default request;
