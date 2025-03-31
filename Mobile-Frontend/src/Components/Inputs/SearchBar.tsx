import React, {useEffect, useState, useCallback} from 'react';
import {TextInput, useTheme} from 'react-native-paper';
import {StyleSheet, Keyboard,Alert} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Voice from '@react-native-voice/voice';
import {useFocusEffect} from '@react-navigation/native';

const SearchBar = ({placeholder, value = '', setValue, ...props}) => {
  const theme = useTheme();
  const iconColor = theme.colors.icon;
  const [recordedText, setRecordedText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const handleVoice = async () => {
    try {
      const isAvailable = await Voice.isAvailable();
      // console.log('op', isAvailable);
      if (isAvailable) {
        await Voice.start('en-US');
        setIsRecording(true);
      } else {
        Alert.alert('Voice Recognition not supported on device');
      }
    } catch (error) {
      console.log('eror', error);
    }
  };
  // useEffect(() => {
  //   Voice.onSpeechStart = onStart;
  //   Voice.onSpeechEnd = onEnd;
  //   Voice.onSpeechResults = onResult;

  //   return () => {
  //     console.log("Voice.destroy().then(Voice.removeAllListeners);")
  //     Voice.destroy().then(Voice.removeAllListeners);
  //   };
  // }, []);

  useFocusEffect(
    useCallback(() => {
      Voice.onSpeechStart = onStart;
      Voice.onSpeechEnd = onEnd;
      Voice.onSpeechResults = onResult;
      return () => {
        console.log('Voice.destroy().then(Voice.removeAllListeners);');
        Voice.destroy().then(Voice.removeAllListeners);
      };
    }, []),
  );

  const onStart = () => {
    setIsRecording(true);
    console.log('start');
  };
  const onEnd = async () => {
    try {
      setIsRecording(false);
      // await Voice.end();
    } catch (error) {
      console.log(error);
    }
  };
  let myTimeout;

  const onResult = e => {
    Voice.removeAllListeners();
    clearTimeout(myTimeout);
    console.log(e?.value?.[0], 'e?.value?.[0]');
    setRecordedText(e?.value?.[0]);
    myTimeout = setTimeout(() => {
      setIsRecording(false);
      if (props.onSubmitEditing) {
        props.onSubmitEditing(null, e?.value?.[0]);
      }
      Keyboard.dismiss();
    }, 2000);

    // console.log('result', e?.value?.[0], 'op');
  };

  const onCancel = async () => {
    try {
      setIsRecording(false);
      await Voice.stop();
      Keyboard.dismiss();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setValue(recordedText);
  }, [recordedText]);
  return (
    <TextInput
      style={styles.input}
      mode="outlined"
      placeholder={placeholder}
      theme={{roundness: 10}}
      left={
        <TextInput.Icon
          icon={() => (
            <Ionicons
              name={'search'}
              size={20}
              color={iconColor}
              style={{marginHorizontal: 5}}
            />
          )}
        />
      }
      right={
        <TextInput.Icon
          icon={isRecording ? 'close' : 'microphone'}
          color={iconColor}
          size={22}
          style={{marginHorizontal: 5}}
          onPress={isRecording ? onCancel : handleVoice}
        />
      }
      {...props}
      value={value}
      onBlur={() => Voice.destroy().then(Voice.removeAllListeners)}
      onChangeText={text => setValue(text)}
    />
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  input: {marginVertical:10,width:'90%', alignSelf:'center',backgroundColor: '#fff'},
});
