import React from 'react';


import { ActivityIndicator, View } from 'react-native';
import {useTheme} from 'react-native-paper';
const CustomLoading = ({containerStyle}) => {
    const theme  = useTheme();
    const primaryColor = theme.colors.primary;
    return <View style={[{flex: 1, justifyContent: 'center', alignItems: 'center'}, containerStyle]}>
        <ActivityIndicator size="large" color={primaryColor}/>
    </View>;
};

export default CustomLoading;
