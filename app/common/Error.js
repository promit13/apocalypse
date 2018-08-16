import React from 'react';
import { Text } from 'react-native';

const styles = {
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#001331',
  },
};

export default ErrorMessage = ({ errorMessage }) => {
  return (
    <Text style={{ color: 'red', marginLeft: 10, marginTop: 10 }}>
      {errorMessage}
    </Text>
  );
};
