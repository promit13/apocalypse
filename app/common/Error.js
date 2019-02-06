import React from 'react';
import { Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

const styles = {
  textStyle: {
    color: 'red',
    marginLeft: 10,
    marginTop: 10,
    fontSize: moderateScale(16),
  },
};

export default ErrorMessage = ({ errorMessage }) => {
  return (
    <Text style={styles.textStyle}>
      {errorMessage}
    </Text>
  );
};
