import * as React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {HOME_TOUR_COUNTER} from '../Redux/Types';
import { useAppDispatch } from '../Redux/hooks';
export const Button = ({wrapperStyle, style, children, ...rest}) => (
  <View style={[styles.button, wrapperStyle]}>
    <Text
      style={[styles.buttonText, style]}
      testID={'TourGuideButtonText'}
      {...rest}>
      {children}
    </Text>
  </View>
);

const Tooltip = ({
  isFirstStep,
  isLastStep,
  handleNext,
  handlePrev,
  handleStop,
  currentStep,
  labels,
}) => {
  const dispatch = useAppDispatch();

  return (
    <View
      style={{
        borderRadius: 16,
        paddingTop: 24,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 16,
        width: '80%',
        backgroundColor: '#ffffffef',
      }}>
      <View style={styles.tooltipContainer}>
        <Text testID="stepDescription" style={styles.tooltipText}>
          {currentStep && currentStep.text}
        </Text>
      </View>
      <View style={[styles.bottomBar]}>
        {!isLastStep ? (
          <TouchableOpacity
            onPress={() => {
              dispatch({type: HOME_TOUR_COUNTER, payload: 18});
              handleStop();
            }}>
            <Button>{labels?.skip || 'Skip'}</Button>
          </TouchableOpacity>
        ) : null}
        {!isFirstStep ? (
          <TouchableOpacity onPress={handlePrev}>
            <Button>{labels?.previous || 'Previous'}</Button>
          </TouchableOpacity>
        ) : null}
        {!isLastStep ? (
          <TouchableOpacity onPress={handleNext}>
            <Button>{labels?.next || 'Next'}</Button>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleStop}>
            <Button>{labels?.finish || 'Finish'}</Button>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
export default Tooltip;
const Z_INDEX = 100;
const MARGIN = 13;
const OFFSET_WIDTH = 4;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: Z_INDEX,
  },
  tooltip: {
    position: 'absolute',
    paddingHorizontal: 15,
    overflow: 'hidden',
    width: '100%',
    borderRadius: 16,
    paddingTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 16,
  },
  tooltipText: {
    textAlign: 'center',
    color: 'black',
  },
  tooltipContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '80%',
  },
  button: {
    padding: 10,
  },
  buttonText: {
    color: '#27ae60',
  },
  bottomBar: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  overlayContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  },
});
