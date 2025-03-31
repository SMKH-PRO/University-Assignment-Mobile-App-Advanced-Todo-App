import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, TextInput, Animated} from 'react-native';
import PropTypes from 'prop-types';
import {useTheme, IconButton} from 'react-native-paper';

const TextInputt = ({
  label,
  onChange,
  value,
  left,
  right,
  style,
  containerStyle,
  leftContainerStyle,
  labelStyle,
  animationDuration,
  colorBeforeFocus,
  colorAfterFocus,
  topBeforeFocus,
  topAfterFocus,
  fontSizeBeforeFocus,
  fontSizeAfterFocus,
  inputStyle,
  height,
  multiline,
  secureTextEntry,
  ...props
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPass, setShowPass] = useState(secureTextEntry);
  const [Animation, setAnimation] = useState(
    new Animated.Value(value?.length ? 1 : 0),
  );
  let onFocus = () => {
    setIsFocused(true);
  };
  let onBlur = () => {
    setIsFocused(false);
  };

  let top = Animation.interpolate({
      inputRange: [0, 1],
      outputRange: [topBeforeFocus || 15, (topAfterFocus, 7)],
    }),
    fontSize = Animation.interpolate({
      inputRange: [0, 1],
      outputRange: [fontSizeBeforeFocus || 18, fontSizeAfterFocus || 12],
    }),
    color = Animation.interpolate({
      inputRange: [0, 1],
      outputRange: [
        colorBeforeFocus || '#aaa',
        colorAfterFocus || theme.colors.primary,
      ],
    });

  useEffect(() => {
    Animated.timing(Animation, {
      toValue: isFocused || value?.length ? 1 : 0,
      duration: animationDuration || 150,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  let hasLeft = Boolean(left);
  let hasRight = Boolean(right);
  return (
    <View
      style={[
        styles.containerStyle,
        containerStyle,
        {backgroundColor: isFocused ? '#fff' : '#f5f5f5'},
      ]}
      onPress={() => console.log('PRESSED')}>
      {hasLeft && (
        <View style={[styles.leftContainerStyle, leftContainerStyle]}>
          {left}
        </View>
      )}
      <View style={{flex: 1}}>
        {label && (
          <Animated.Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[
              styles.labelStyle,
              {left: hasLeft ? 0 : 10},
              labelStyle,
              {
                // transform: [{ translateY: top }],

                top,
                fontSize,
                color,
              },
            ]}>
            {' '}
            {label}
          </Animated.Text>
        )}
        <TextInput
          style={[
            styles.inputStyle,
            {
              paddingLeft: hasLeft ? 4 : 15,
              ...(multiline ? {} : {height: 56}),
            },
            inputStyle,
          ]}
          onChangeText={newText => {
            if (typeof onChange == 'function') onChange(newText);
          }}
          value={value}
          onBlur={onBlur}
          onFocus={onFocus}
          multiline={multiline}
          autoCapitalize="none"
          secureTextEntry={showPass}
          {...props}
        />
      </View>
      {!secureTextEntry ? (
        hasRight && (
          <View style={[styles.leftContainerStyle, leftContainerStyle]}>
            {right}
          </View>
        )
      ) : (
        <View style={[styles.leftContainerShow, leftContainerStyle]}>
          <IconButton
            icon={!showPass ? 'eye-off' : 'eye'}
            color={theme.colors.primary}
            size={20}
            onPress={() => setShowPass(!showPass)}
          />
        </View>
      )}
    </View>
  );
};

TextInputt.propTypes = {
  label: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  style: PropTypes.object,
  containerStyle: PropTypes.object,
  labelContainerStyle: PropTypes.object,
  labelStyle: PropTypes.object,
  inputStyle: PropTypes.object,
  fontSizeBeforeFocus: PropTypes.number,
  fontSizeAfterFocus: PropTypes.number,
  topBeforeFocus: PropTypes.number,
  topAfterFocus: PropTypes.number,
  animationDuration: PropTypes.number,
  colorBeforeFocus: PropTypes.string,
  colorAfterFocus: PropTypes.string,
  multiline: PropTypes.bool,
  secureTextEntry: PropTypes.bool,
};

TextInputt.defaultProps = {
  label: 'Label',
  onChange: () =>
    console.warn(`Missing Prop 'onChange' in TextInput Component.`),
  value: '',
  secureTextEntry: false,
};
let styles = StyleSheet.create({
  containerStyle: {
    //width: '100%',
    flex: 1,
    margin: 6,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: 'silver',
    minHeight: 56,
    //  paddingLeft: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    //  paddingTop: 20
    //alignItems: 'flex-end'
    backgroundColor: '#f5f5f5',
  },
  leftContainerShow: {
    // backgroundColor: 'black',
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    // width:10
  },
  leftContainerStyle: {
    // backgroundColor: 'black',
    // padding: 8,
    paddingRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
    // width:10
  },
  labelStyle: {
    position: 'absolute',
    paddingRight: 5,
    //  top: -8,
    paddingBottom: 0,
  },
  inputStyle: {
    // backgroundColor: 'black',
    marginTop: 2,
    paddingTop: 20,
    minHeight: 56,
    flex: 1,
    color: 'black',

    //paddingBottom: 8,
    //  flex: 1,
    //alignSelf: 'flex-end'
    //  marginTop: 5,
  },
});
export default TextInputt;
