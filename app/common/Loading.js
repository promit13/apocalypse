import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import LoadScreen from './LoadScreen';

const styles = {
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#001331',
  },
};

export default function Loading() {
  return (
    <ActivityIndicator size="large" color="gray" style={{ marginTop: 20 }} />
    // <View style={styles.container}>
    //   <LoadScreen />
    // </View>
  );
}
