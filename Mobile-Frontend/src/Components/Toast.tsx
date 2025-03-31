import Toast from 'react-native-simple-toast';
const ToastComponent = (text, type = 'long') =>
  Toast.show(
    text,
    type === 'long' ? Toast.LONG : Toast.SHORT,
  );
export default ToastComponent;
